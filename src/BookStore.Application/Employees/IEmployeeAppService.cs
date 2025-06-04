using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.Employees.Dtos;
using BookStore.Students.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Employees
{
    public interface IEmployeeAppService:IApplicationService
    {
        Task<PagedResultDto<EmployeeDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateEmployeeDto input);
        Task UpdateAsync(CreateEmployeeDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
