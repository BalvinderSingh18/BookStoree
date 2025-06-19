using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.TaskManagements.Dtos;
using BookStore.TaskManagments;
using System.Threading.Tasks;

namespace BookStore.TaskManagements
{
    public interface ITaskManagementAppService : IApplicationService
    {
        Task<PagedResultDto<TaskManagementDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task<ListResultDto<TaskUserDto>> GetAllUsersForTaskAsync();
        Task<TaskManagementDto> CreateAsync(CreateTaskManagementDto input);
        Task<TaskManagementDto> UpdateAsync(CreateTaskManagementDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
