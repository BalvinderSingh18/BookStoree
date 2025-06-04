using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using System.Threading.Tasks;

namespace BookStore.Books
{
    public interface IBookAppService : IApplicationService
    {
        Task<PagedResultDto<GetBookDto>> GetAll();
        Task CreateAsync(CreateBookDto input);
        Task UpdateAsync(CreateBookDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
