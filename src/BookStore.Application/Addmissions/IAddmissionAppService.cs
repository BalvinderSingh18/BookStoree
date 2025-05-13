using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Addmissions.Dtos;
using BookStore.Books.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Addmissions
{
    public interface IAddmissionAppService:IApplicationService
    {
        Task<List<Dashboard>> GetAllDashboard();
        Task<List<DailyStatDto>> GetDailyStats();
        Task<PagedResultDto<AddmissionDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateAddmissionDto input);
        Task UpdateAsync(CreateAddmissionDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
