using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.Deals.Dtos;
using BookStore.Patients.Dtos;
using BookStore.Tasks.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace BookStore.Deals
{
    public interface IDealAppService:IApplicationService
    {
        Task<PagedResultDto<DealWithTasksDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task<DealWithTasksDto> CreateAsync(CreateDealDto input);
        Task<DealWithTasksDto> UpdateAsync(CreateDealDto input);
        Task DeleteAsync(DeleteDealOrTaskInput input);
    }
}
