using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.Courses.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Courses
{
    public interface ICourseAppService : IApplicationService
    {
        Task<PagedResultDto<CourseDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreateCourseDto input);
        Task UpdateAsync(CreateCourseDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
