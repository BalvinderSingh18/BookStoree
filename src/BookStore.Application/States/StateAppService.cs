using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Books.Dtos;
using BookStore.Countries;
using BookStore.Countries.Dtos;
using BookStore.States.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.States
{
    public class StateAppService : ApplicationService, IStateAppService
    {
        private readonly IRepository<State> _stateRepository;
        public StateAppService(IRepository<State> stateRepositoryl)
        {
                _stateRepository = stateRepositoryl;
        }
        public async Task CreateAsync(CreateStateDto input)
        {
            try
            {
                var state = new State
                {
                    Name = input.Name,
                    CountryId = input.CountryId,
                };
                await _stateRepository.InsertAsync(state);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _stateRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<StateDto>> GetAll(GetAllAccountsInput input)
        {
            var query = _stateRepository.GetAllIncluding(s => s.Country);

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.Name.Contains(input.Keyword));
            }
            query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Name);
            var states = await query.ToListAsync();

            var result = states.Select(state => new StateDto
            {
                Id = state.Id,
                Name = state.Name,
                CountryId=state.CountryId,
                CountryName=state.Country?.Name,
            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<StateDto>(totalCount, result);
        }

        public async Task UpdateAsync(CreateStateDto input)
        {
            try
            {
                var state = await _stateRepository.GetAsync(input.Id);

                state.Name = input.Name;
                state.CountryId= input.CountryId;

                await _stateRepository.UpdateAsync(state);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
    }
}
