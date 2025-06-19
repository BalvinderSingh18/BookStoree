using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using BookStore.Authorization;
using BookStore.Authorization.Users;
using BookStore.Books;
using BookStore.Books.Dtos;
using BookStore.Students;
using BookStore.Students.Dtos;
using BookStore.TaskManagements.Dtos;
using BookStore.TaskManagments;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using BookStore.SignalR;
using Abp.Runtime.Session;

namespace BookStore.TaskManagements
{
    public class TaskManagementAppService : ApplicationService, ITaskManagementAppService
    {
        private readonly IRepository<TaskManagment> _taskManagmentsRepository;
        private readonly UserManager<User> _userManager;
        private readonly IHubContext<TaskDiscussionHub> _hubContext;
        public TaskManagementAppService(IRepository<TaskManagment> taskManagmentsRepository, UserManager<User> userManager, IHubContext<TaskDiscussionHub> hubContext)
        {
            _taskManagmentsRepository = taskManagmentsRepository;
            _userManager = userManager;
            _hubContext = hubContext;
        }
        [AbpAuthorize(AppPermissions.Pages_TaskManagement_Create)]
        public async Task<TaskManagementDto> CreateAsync(CreateTaskManagementDto input)
        {
            try
            {
                var taskManagement = new TaskManagment
                {
                    Title = input.Title,
                    Description = input.Description,
                    UserId=input.AssignedUserId,
                    TaskStatus = input.TaskStatus,
                    Creation_Time = input.Creation_Time,
                    Discussion=input.Discussion,
                };
                if (AbpSession.TenantId != null)
                {
                    taskManagement.TenantId = AbpSession.TenantId;
                }
                await _taskManagmentsRepository.InsertAsync(taskManagement);
                return new TaskManagementDto
                {
                    Id = taskManagement.Id,
                    Title = taskManagement.Title,
                    Description = taskManagement.Description,
                    AssignedUserId=taskManagement.UserId,
                    TaskStatus=taskManagement.TaskStatus,
                    Creation_Time = taskManagement.Creation_Time,
                    Discussion=taskManagement.Discussion,
                    
                };
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [AbpAuthorize(AppPermissions.Pages_TaskManagement_Delete)]
        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _taskManagmentsRepository.DeleteAsync(input.Id);
        }
        [AbpAuthorize(AppPermissions.Pages_TaskManagement_View)]
        public async Task<PagedResultDto<TaskManagementDto>> GetAll(GetAllAccountsInput input)
        {
            var query = _taskManagmentsRepository.GetAllIncluding(t => t.User);
            // Filtering by keyword (Title, Description, or UserName)
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(t =>
                    t.Title.Contains(input.Keyword) ||
                    t.Description.Contains(input.Keyword) ||
                    t.User.UserName.Contains(input.Keyword));
            }
            var totalCount = await query.CountAsync();
            //// Sorting
            //query = !string.IsNullOrWhiteSpace(input.Sorting)
            //    ? query.OrderBy(input.Sorting)
            //    : query.OrderBy(t => t.CreationTime);
            //// Apply pagination
            var taskManagments = await query
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
                .ToListAsync();
            var result = query.Select(task => new TaskManagementDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                AssignedUserId = task.UserId,
                UserName = task.User != null ? task.User.UserName : "Unknown User",
                TaskStatus=task.TaskStatus,
                Creation_Time = task.CreationTime,
                Discussion=task.Discussion,
                
            }).ToList();
            return new PagedResultDto<TaskManagementDto>(totalCount, result);
        }
        
        public async Task<ListResultDto<TaskUserDto>> GetAllUsersForTaskAsync()
        {
            var users = await _userManager.Users
                .Select(u => new TaskUserDto
                {
                    Id = u.Id,
                    UserName = u.UserName
                })
                .ToListAsync();

            return new ListResultDto<TaskUserDto>(users);
        }

        [AbpAuthorize(AppPermissions.Pages_TaskManagement_Edit)]
        public async Task<TaskManagementDto> UpdateAsync(CreateTaskManagementDto input)
        {
            try
            {
                var taskManagment = await _taskManagmentsRepository.GetAsync(input.Id);

                taskManagment.Title = input.Title;
                taskManagment.Description = input.Description;
                taskManagment.UserId = input.AssignedUserId;
                taskManagment.TaskStatus = input.TaskStatus;
                taskManagment.Discussion = input.Discussion;

                if (AbpSession.TenantId != null)
                {
                    taskManagment.TenantId = AbpSession.TenantId;
                }

                await _taskManagmentsRepository.UpdateAsync(taskManagment);

                // ✅ SignalR: Notify clients about update
                //var currentUser = await _userManager.FindByIdAsync(AbpSession.UserId?.ToString());
                //await _hubContext.Clients.All.SendAsync("ReceiveDiscussionUpdate", taskManagment.Id, currentUser?.UserName ?? "System");
                await _hubContext.Clients.All.SendAsync("ReceiveDiscussionUpdate", new
                {
                    taskId = taskManagment.Id,
                    discussion = taskManagment.Discussion
                });

                return new TaskManagementDto
                {
                    Id = taskManagment.Id,
                    Title = taskManagment.Title,
                    Description = taskManagment.Description,
                    AssignedUserId = taskManagment.UserId,
                    TaskStatus = taskManagment.TaskStatus,
                    Creation_Time = taskManagment.Creation_Time,
                    Discussion = taskManagment.Discussion,
                };
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}
