using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.UI;
using BookStore.Books.Dtos;
using BookStore.Deals.Dtos;
using BookStore.Tasks;
using BookStore.Tasks.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace BookStore.Deals
{
    public class DealAppService : ApplicationService, IDealAppService
    {
        private readonly IRepository<Deal>_dealsRepository;
        private readonly IRepository<TaskItem> _taskItemRepository;
        public DealAppService(IRepository<Deal> dealsRepository, IRepository<TaskItem> taskItemRepository)
        {
            _dealsRepository = dealsRepository;
            _taskItemRepository = taskItemRepository;
        }
        public async Task<DealWithTasksDto> CreateAsync(CreateDealDto input)
        {
            Deal deal;

            if (input.Id != 0)
            {
                // Fetch existing deal
                deal = await _dealsRepository.GetAsync(input.Id);
                if (deal == null)
                {
                    throw new UserFriendlyException($"Deal with Id {input.Id} not found.");
                }
            }
            else
            {
                // Create new deal
                deal = new Deal
                {
                    Name = input.Name,
                    Created_Date = input.CreatedDate
                };

                await _dealsRepository.InsertAsync(deal);
                await CurrentUnitOfWork.SaveChangesAsync(); // ensures deal.Id is generated
            }
            var taskdto = new List<TaskDto>();
            foreach (var taskDto in input.Tasks)
            {
                var task = new TaskItem
                {
                    Task_Number = taskDto.Task_Number,
                    Title = taskDto.Title,
                    Date_From = taskDto.Date_From,
                    To_Date = taskDto.To_Date,
                    Description = taskDto.Description,
                    DealId = deal.Id
                };

                await _taskItemRepository.InsertAsync(task);

                taskdto.Add(new TaskDto
                {
                    Id = task.Id,
                    Task_Number=task.Task_Number,
                    Title = task.Title,
                    Date_From = task.Date_From,
                    To_Date = task.To_Date,
                    Description = task.Description,
                    DealId = task.DealId,

                });
            }
            return new DealWithTasksDto
            {
                Id = deal.Id,
                Name = deal.Name,
                CreatedDate = deal.Created_Date,
                Tasks = taskdto
            };

        }

        public async Task DeleteAsync(DeleteDealOrTaskInput input)
        {
            if (input.Type == "deal")
            {
                var deal = await _dealsRepository.FirstOrDefaultAsync(input.Id);
                if (deal == null)
                {
                    throw new UserFriendlyException("Deal not found.");
                }

                await _dealsRepository.DeleteAsync(deal); // Will also delete tasks if cascade is set
            }
            else if (input.Type == "task")
            {
                var task = await _taskItemRepository.FirstOrDefaultAsync(input.Id);
                if (task == null)
                {
                    throw new UserFriendlyException("Task not found.");
                }

                await _taskItemRepository.DeleteAsync(task);
            }
            else
            {
                throw new UserFriendlyException("Invalid delete type. Must be 'deal' or 'task'.");
            }
        }

        public async Task<PagedResultDto<DealWithTasksDto>> GetAll(GetAllAccountsInput input)
        {
            var dealsQuery = _dealsRepository.GetAll();

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                dealsQuery = dealsQuery.Where(d => d.Name.Contains(input.Keyword)||
                d.Created_Date.ToString().Contains(input.Keyword)
                );
            }
            dealsQuery = !string.IsNullOrWhiteSpace(input.Sorting) ? dealsQuery.OrderBy(input.Sorting) : dealsQuery.OrderBy(d => d.Name).OrderBy(d=>d.Created_Date);
            var totalCount = await dealsQuery.CountAsync();
            var deals = await dealsQuery
            .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
                .ToListAsync();

            var dealIds = deals.Select(d => d.Id).ToList();

            var tasks = await _taskItemRepository
                .GetAll()
                .Where(t => dealIds.Contains(t.DealId))
                .ToListAsync();

            var dealDtos = deals.Select(deal =>
            {
                var relatedTasks = tasks
                    .Where(t => t.DealId == deal.Id)
                    .Select(t => new TaskDto
                    {
                        Id = t.Id,
                        Task_Number = t.Task_Number,
                        Title = t.Title,
                        Date_From = t.Date_From,
                        To_Date = t.To_Date,
                        Description = t.Description,
                        DealId=t.DealId
                    }).ToList();

                return new DealWithTasksDto
                {
                    Id = deal.Id,
                    Name = deal.Name,
                    CreatedDate = deal.Created_Date,
                    Tasks = relatedTasks
                };
            }).ToList();

            return new PagedResultDto<DealWithTasksDto>(totalCount, dealDtos);
        }

        public async Task<DealWithTasksDto> UpdateAsync(CreateDealDto input)
        {
            var deal = await _dealsRepository.FirstOrDefaultAsync(input.Id);
            if (deal == null)
            {
                throw new Exception($"Deal with Id {input.Id} not found.");
            }

            deal.Name = input.Name;
            deal.Created_Date = input.CreatedDate;

            await _dealsRepository.UpdateAsync(deal);
            await CurrentUnitOfWork.SaveChangesAsync();

            // Step 3: Delete existing tasks linked to this deal
            var existingTasks = await _taskItemRepository.GetAllListAsync(t => t.DealId == deal.Id);
            foreach (var task in existingTasks)
            {
                await _taskItemRepository.DeleteAsync(task);
            }

            // Step 4: Insert new tasks from input
            var taskDtos = new List<TaskDto>();
            foreach (var taskDto in input.Tasks)
            {
                var newTask = new TaskItem
                {
                    Task_Number = taskDto.Task_Number,
                    Title = taskDto.Title,
                    Date_From = taskDto.Date_From,
                    To_Date = taskDto.To_Date,
                    Description = taskDto.Description,
                    DealId = deal.Id
                };

                await _taskItemRepository.InsertAsync(newTask);

                taskDtos.Add(new TaskDto
                {
                    Id = newTask.Id,
                    Task_Number = newTask.Task_Number,
                    Title = newTask.Title,
                    Date_From = newTask.Date_From,
                    To_Date = newTask.To_Date,
                    Description = newTask.Description
                });
            }

            // Step 5: Return updated deal with its tasks
            return new DealWithTasksDto
            {
                Id = deal.Id,
                Name = deal.Name,
                CreatedDate = deal.Created_Date,
                Tasks = taskDtos
            };
        }

    }
}
