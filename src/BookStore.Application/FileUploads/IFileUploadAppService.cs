using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.FileUploads.Dtos;
using BookStore.Roles.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.FileUploads
{
    public interface IFileUploadAppService:IApplicationService
    {
        Task<CreateFileUploadDto> UploadFileAsync(CreateFileUploadDto input);
        Task<PagedResultDto<FileUploadDto>> GetAll(GetAllAccountsInput input);
        Task UpdateAsync(UpdateFileUploadDto input);
        Task DeleteAsync(EntityDto<int> input);
        Task<FileUploadDto> DownloadAsync(string fileName);

    }
}
