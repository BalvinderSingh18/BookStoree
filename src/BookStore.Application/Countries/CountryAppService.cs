using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Books.Dtos;
using BookStore.Countries.Dtos;
using BookStore.Students;
using BookStore.Students.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Countries
{
    public class CountryAppService : ApplicationService, ICountryAppService
    {
        private readonly IRepository<Country> _countryRepository;
        public CountryAppService(IRepository<Country> countryRepository)
        {
                _countryRepository = countryRepository;
        }
        public async Task CreateAsync(CreateCountryDto input)
        {
            try
            {
                var country = new Country
                {
                    Name = input.Name,
                };
                await _countryRepository.InsertAsync(country);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _countryRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<CountryDto>> GetAll(GetAllAccountsInput input)
        {
            //var query = _studentRepository.GetAll();
            var query = _countryRepository.GetAll();

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.Name.Contains(input.Keyword));
            }
            query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Name);
            var countries = await query.ToListAsync();

            var result = countries.Select(country => new CountryDto
            {
                Id = country.Id,
                Name = country.Name,
            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<CountryDto>(totalCount, result);
        }

        public async Task UpdateAsync(CreateCountryDto input)
        {
            try
            {
                var country = await _countryRepository.GetAsync(input.Id);

                country.Name = input.Name;

                await _countryRepository.UpdateAsync(country);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
    }
}
