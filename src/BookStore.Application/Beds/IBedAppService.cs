using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Beds.Dtos;
using BookStore.Books.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Beds
{
    public interface IBedAppService:IApplicationService
    {
        Task<PagedResultDto<BedDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateBedDto input);
        Task UpdateAsync(CreateBedDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
