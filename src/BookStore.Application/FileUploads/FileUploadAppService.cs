using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.UI;
using BookStore.Books.Dtos;
using BookStore.FileUploads.Dtos;
using BookStore.Roles.Dto;
using Microsoft.AspNetCore.Components;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.FileUploads
{
    [Route("api/app/file-upload")]
    public class FileUploadAppService : ApplicationService, IFileUploadAppService
    {
        private readonly IRepository<FileUpload> _fileUploadRepository;
        public FileUploadAppService(IRepository<FileUpload> fileUploadRepository)
        {
                _fileUploadRepository = fileUploadRepository;
        }
        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _fileUploadRepository.DeleteAsync(input.Id);
        }
        public async Task<FileUploadDto> DownloadAsync(string fileName)
        {
            try
            {
                var fileDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "upload");

                var fullPath = Path.Combine(fileDirectory, fileName);
                if (!System.IO.File.Exists(fullPath))
                {
                    throw new UserFriendlyException("File not found.");
                }

                var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
                var contentType = "application/octet-stream";

                var fileBytes = await File.ReadAllBytesAsync(fullPath);

                var result = new FileUploadDto
                {
                    FileName = fileName,
                    FilePath = "/upload/" + fileName,  // optional: provide the public URL path
                    FileContent = fileBytes,           // Add this property to your DTO
                   // MimeType = GetMimeType(fileName)   // optional if needed
                };

                return result;
            }
            catch (Exception ex)
            {
                Logger.Error("Download failed", ex);
                throw;
            }
        }


        public async Task<PagedResultDto<FileUploadDto>> GetAll(GetAllAccountsInput input)
        {
            try
            {
                var query = _fileUploadRepository.GetAll();

                if (!string.IsNullOrWhiteSpace(input.Keyword))
                {
                    query = query.Where(x => x.File_Name.Contains(input.Keyword));
                }

                var totalCount = await query.CountAsync();

                var fileList = await query
                    .OrderByDescending(x=>x.File_Name)
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
                    .ToListAsync();

                var result = fileList.Select(file => new FileUploadDto
                {
                    Id = file.Id,
                    FileName = file.File_Name,
                    FilePath = file.File_Path
                }).ToList();

                return new PagedResultDto<FileUploadDto>(totalCount, result);
            }
            catch (Exception ex)
            {
                Logger.Error("Error while fetching uploaded files", ex);
                throw;
            }
        }

        public async Task UpdateAsync(UpdateFileUploadDto input)
        {
            try
            {
                // Retrieve the file upload record by ID
                var fileUpload = await _fileUploadRepository.GetAsync(input.Id);

                if (fileUpload == null)
                {
                    throw new Exception("File upload record not found");
                }

                // Update file details
                fileUpload.File_Name = input.FileName;
                fileUpload.File_Path = input.FilePath; // Update file path if necessary

                // Save changes to the database
                await _fileUploadRepository.UpdateAsync(fileUpload);

                // Return updated FileUploadDto
                var fileUploadDto = new FileUploadDto
                {
                    Id = fileUpload.Id,
                    FileName = fileUpload.File_Name,
                    FilePath = fileUpload.File_Path
                };


            }

            catch (Exception ex)
            {
                Logger.Error("Error while updating file", ex);
                throw;  // Rethrow the exception to maintain ABP's error handling
            }
        }

        public async Task<CreateFileUploadDto> UploadFileAsync(CreateFileUploadDto input)
        {
            try
            {
                // Define file upload directory
                var fileDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "upload");

                // Create directory if it does not exist
                if (!Directory.Exists(fileDirectory))
                {
                    Directory.CreateDirectory(fileDirectory);
                }

                // Generate file path
                var filePath = Path.Combine(fileDirectory, input.FileName);

                // Convert Base64 string to byte array and write to file
                var fileBytes = Convert.FromBase64String(input.FilePath);
                await File.WriteAllBytesAsync(filePath, fileBytes);

                // Create a FileUpload entity
                var fileUpload = new FileUpload
                {
                    File_Name = input.FileName,
                    File_Path = "/upload/" + input.FileName  // Save relative path
                };

                // Save entity to database
                await _fileUploadRepository.InsertAsync(fileUpload);

                // Manually map entity to DTO (without AutoMapper)
                var resultDto = new CreateFileUploadDto
                {
                    Id = fileUpload.Id,
                    FileName = fileUpload.File_Name,
                    FilePath = fileUpload.File_Path,
                };

                return resultDto;
            }
            catch (Exception ex)
            {
                Logger.Error("Error while uploading file", ex);
                throw;
            }
        }
    }
}
