using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.Countries.Dtos;
using BookStore.Students.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Countries
{
    public interface ICountryAppService:IApplicationService
    {
        Task<PagedResultDto<CountryDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateCountryDto input);
        Task UpdateAsync(CreateCountryDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
