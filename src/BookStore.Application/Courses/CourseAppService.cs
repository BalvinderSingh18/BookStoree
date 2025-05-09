using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Books.Dtos;
using BookStore.Courses.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Courses
{
    public class CourseAppService : ApplicationService, ICourseAppService
    {
        private readonly IRepository<Course> _courseRepository;
        public CourseAppService(IRepository<Course> courseRepository)
        {
            _courseRepository = courseRepository;
        }
        public async Task CreateAsync(CreateCourseDto input)
        {
            try
            {
                var course = new Course
                {
                    Name = input.Name,
                    Description = input.Description,
                };
                await _courseRepository.InsertAsync(course);
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
                await _courseRepository.DeleteAsync(input.Id);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public async Task<PagedResultDto<CourseDto>> GetAll(GetAllAccountsInput input)
        {
            var query = _courseRepository.GetAll();

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                  d.Name.Contains(input.Keyword) ||
                  d.Description.Contains(input.Keyword));
            }
            query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Name);

            var courses = await query.ToListAsync();
            var result = courses.Select(course => new CourseDto
            {
                Id=course.Id,
                Name = course.Name,
                Description = course.Description,
            }).ToList();

            var totalCount = result.Count;
            return new PagedResultDto<CourseDto>(totalCount, result);
        }

        public async Task UpdateAsync(CreateCourseDto input)
        {
            try
            {
                var course = await _courseRepository.GetAsync(input.Id);

                course.Name = input.Name;
                course.Description = input.Description;

                await _courseRepository.UpdateAsync(course);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
    }
}
