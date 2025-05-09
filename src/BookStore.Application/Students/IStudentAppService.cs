using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.Courses.Dtos;
using BookStore.Students.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Students
{
    public interface IStudentAppService : IApplicationService
    {
        Task<PagedResultDto<StudentDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateStudentDto input);
        Task UpdateAsync(CreateStudentDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
