using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.States.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.States
{
    public interface IStateAppService:IApplicationService
    {
        Task<PagedResultDto<StateDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateStateDto input);
        Task UpdateAsync(CreateStateDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
