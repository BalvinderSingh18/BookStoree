using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Beds;
using BookStore.Beds.Dtos;
using BookStore.Books.Dtos;
using BookStore.Departments.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Departments
{
    public class DepartmentAppService : ApplicationService, IDepartmentAppService
    {
        private readonly IRepository<Department> _departmentsRepository;
        public DepartmentAppService(IRepository<Department> departmentsRepository)
        {
                _departmentsRepository = departmentsRepository;
        }
        public async Task CreateAsync(CreateDepartmentDto input)
        {
            try
            {
                var department = new Department
                {
                    Name = input.Name
                };
                await _departmentsRepository.InsertAsync(department);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _departmentsRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<DepartmentDto>> GetAll(GetAllAccountsInput input)
        {
            var query = _departmentsRepository.GetAll();

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.Name.Contains(input.Keyword));
            }
            query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Name);
            var departments = await query.ToListAsync();

            var result = departments.Select(department => new DepartmentDto
            {
                Id = department.Id,
                Name = department.Name
            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<DepartmentDto>(totalCount, result);
        }

        public async Task UpdateAsync(CreateDepartmentDto input)
        {
            try
            {
                var department = await _departmentsRepository.GetAsync(input.Id);

                department.Name = input.Name;

                await _departmentsRepository.UpdateAsync(department);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
