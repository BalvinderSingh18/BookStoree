using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Books.Dtos;
using BookStore.Courses.Dtos;
using BookStore.Students.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Students
{
    public class StudentAppService : ApplicationService, IStudentAppService
    {
        private readonly IRepository<Student> _studentRepository;
        public StudentAppService(IRepository<Student> studentRepository)
        {
            _studentRepository = studentRepository;
        }
        public async Task CreateAsync(CreateStudentDto input)
        {

            try
            {
                var student = new Student
                {
                    Name = input.Name,
                    Address = input.Address,
                    Gender=input.Gender,
                    Dob = input.Dob,
                    CourseId = input.CourseId,
                    CountryId = input.CountryId,
                    StateId= input.StateId,
                    CityId= input.CityId,
                };
                await _studentRepository.InsertAsync(student);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _studentRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<StudentDto>> GetAll(GetAllAccountsInput input)
        {
            //var query = _studentRepository.GetAll();
            var query = _studentRepository.GetAllIncluding(s => s.Course,s=>s.Country,s=>s.State,s=>s.City);

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.Name.Contains(input.Keyword) ||
                d.Address.Contains(input.Keyword));
            }
            query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Name).OrderBy(d=>d.Address).OrderBy(d => d.Gender).OrderBy(d => d.Dob).OrderBy(d => d.CourseId);
            var students = await query.ToListAsync();

            var result = students.Select(student => new StudentDto
            {
                Id=student.Id,
                Name = student.Name,
                Address = student.Address,
                Gender=student.Gender,
                Dob = student.Dob,
                CourseId = student.CourseId,
                CourseName=student.Course?.Name,
                CountryId = student.CountryId ??0,
                CountryName = student.Country?.Name,

                StateId = student.StateId ??0,
                StateName = student.State?.Name,

                CityId = student.CityId ??0,
                CityName = student.City?.Name


            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<StudentDto>(totalCount, result);
        }
        public async Task UpdateAsync(CreateStudentDto input)
        {
            try
            {
                var student = await _studentRepository.GetAsync(input.Id);
                
                student.Name = input.Name;
                student.Address = input.Address;
                student.Gender=input.Gender;
                student.Dob = input.Dob;
                student.CourseId = input.CourseId;
                student.CountryId=input.CountryId;
                student.StateId = input.StateId;
                student.CityId=input.CityId;

                await _studentRepository.UpdateAsync(student);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
    }
}
