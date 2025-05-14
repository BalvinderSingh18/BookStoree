using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Beds.Dtos;
using BookStore.Books.Dtos;
using BookStore.Departments.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Departments
{
    public interface IDepartmentAppService:IApplicationService
    {
        Task<PagedResultDto<DepartmentDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateDepartmentDto input);
        Task UpdateAsync(CreateDepartmentDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
