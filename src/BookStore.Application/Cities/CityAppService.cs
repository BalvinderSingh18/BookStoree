using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Books.Dtos;
using BookStore.Cities.Dtos;
using BookStore.States;
using BookStore.States.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Cities
{
    public class CityAppService : ApplicationService, ICityAppService
    {
        private readonly IRepository<City> _cityRepository;
        public CityAppService(IRepository<City> cityRepository)
        {
                _cityRepository = cityRepository;
        }
        public async Task CreateAsync(CreateCityDto input)
        {
            try
            {
                var city = new City
                {
                    Name = input.Name,
                    StateId = input.StateId,
                };
                await _cityRepository.InsertAsync(city);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            try
            {
                await _cityRepository.DeleteAsync(input.Id);
            }
            catch (Exception ex)
            {

                Logger.Error("Error in CreateAsync", ex);
                throw;
            }
        }

        public async Task<PagedResultDto<CityDto>> GetAll(GetAllAccountsInput input)
        {
            var query = _cityRepository.GetAllIncluding(s => s.State,s=>s.State.Country);

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.Name.Contains(input.Keyword));
            }
            query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Name);
            var cities = await query.ToListAsync();

            var result = cities.Select(city => new CityDto
            {
                Id = city.Id,
                Name = city.Name,
                StateId = city.StateId,
                StateName=city.State?.Name,
                CountryName = city.State?.Country?.Name,
            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<CityDto>(totalCount, result);
        }

        public async Task UpdateAsync(CreateCityDto input)
        {
            try
            {
                var city = await _cityRepository.GetAsync(input.Id);

                city.Name = input.Name;
                city.StateId = input.StateId;

                await _cityRepository.UpdateAsync(city);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
    }
}
