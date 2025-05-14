using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.UI;
using BookStore.Books.Dtos;
using BookStore.Employees.Dtos;
using BookStore.Students;
using BookStore.Students.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Employees
{
    public class EmployeeAppService : ApplicationService, IEmployeeAppService
    {
        private readonly IRepository<Employee> _employeeRepository;
        public EmployeeAppService(IRepository<Employee> employeeRepository)
        {
                _employeeRepository = employeeRepository;
        }
        public async Task CreateAsync(CreateEmployeeDto input)
        {
            try
            {
                var existingEmployee = await _employeeRepository
                 .FirstOrDefaultAsync(e => e.Phone_Number == input.PhoneNumber);

                if (existingEmployee != null)
                {
                    throw new UserFriendlyException("Phone number already exists.");
                }
                if (input.Dob >= DateTime.Today)
                {
                    throw new UserFriendlyException("Date of Birth must be a past date.");
                }
                var employee = new Employee
                {
                    Name = input.Name,
                    Address = input.Address,
                    Phone_Number = input.PhoneNumber,
                    Gender = input.Gender,
                    Dob = input.Dob,
                    DepartmentId = input.DepartmentId,
                };
                await _employeeRepository.InsertAsync(employee);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _employeeRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<EmployeeDto>> GetAll(GetAllAccountsInput input)
        {
            var query = _employeeRepository.GetAllIncluding(s => s.Department);

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.Name.Contains(input.Keyword) ||
                d.Phone_Number.Contains(input.Keyword) ||
                d.Dob.ToString().Contains(input.Keyword) ||
                d.Department != null && d.Department.Name.Contains(input.Keyword) ||
                d.Address.Contains(input.Keyword));
            }
            query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Name).OrderBy(d => d.Address).OrderBy(d => d.Dob);
            var employees = await query.ToListAsync();

            var result = employees.Select(employee => new EmployeeDto
            {
                Id = employee.Id,
                Name = employee.Name,
                Address = employee.Address,
                PhoneNumber=employee.Phone_Number,
                Gender = employee.Gender,
                Dob = employee.Dob,
                DepartmentId = employee.DepartmentId,
                DepartmentName = employee.Department?.Name,
            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<EmployeeDto>(totalCount, result);
        }

        public async Task UpdateAsync(CreateEmployeeDto input)
        {
            try
            {
                var employee = await _employeeRepository.GetAsync(input.Id);
                var duplicatePhone = await _employeeRepository
               .FirstOrDefaultAsync(e => e.Phone_Number == input.PhoneNumber && e.Id != input.Id);

                if (duplicatePhone != null)
                {
                    throw new UserFriendlyException("Phone number already exists.");
                }
                if (input.Dob >= DateTime.Today)
                {
                    throw new UserFriendlyException("Date of Birth must be a past date.");
                }
                employee.Name = input.Name;
                employee.Address = input.Address;
                employee.Phone_Number = input.PhoneNumber;
                employee.Gender = input.Gender;
                employee.Dob = input.Dob;
                employee.DepartmentId = input.DepartmentId;

                await _employeeRepository.UpdateAsync(employee);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
    }
}
