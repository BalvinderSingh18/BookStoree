using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.Cities.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Cities
{
    public interface ICityAppService:IApplicationService
    {
        Task<PagedResultDto<CityDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateCityDto input);
        Task UpdateAsync(CreateCityDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
