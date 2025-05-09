using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Beds;
using BookStore.Beds.Dtos;
using BookStore.Books.Dtos;
using BookStore.Patients.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Patients
{
    public class PatientAppService : ApplicationService, IPatientAppService
    {
        private readonly IRepository<Patient> _patientRepository;
        public PatientAppService(IRepository<Patient> patientRepository)
        {
                _patientRepository = patientRepository;
        }
        public async Task CreateAsync(CreatePatientDto input)
        {
            try
            {
                var patient = new Patient
                {
                    Name = input.Name,
                    Age = input.Age,
                    Gender = input.Gender,
                    Phone_Number=input.PhoneNumber,
                    Disease = input.Disease,
                    Doctor = input.Doctor,
                };
                await _patientRepository.InsertAsync(patient);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _patientRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<PatientDto>> GetAll(GetAllAccountsInput input)
        {
            var query = _patientRepository.GetAll();

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.Name.Contains(input.Keyword) ||
                d.Age.ToString().Contains(input.Keyword) ||
                d.Phone_Number.Contains(input.Keyword) ||
                d.Disease.Contains(input.Keyword) ||
                d.Doctor.Contains(input.Keyword)
                );
            }

            var patients = await query.ToListAsync();
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                patients = patients
                    .Where(p => p.Gender.ToString().ToLower().Contains(input.Keyword.ToLower()))
                    .ToList();
            }
            query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Name).OrderBy(d => d.Gender).OrderBy(d => d.Age).OrderBy(d => d.Doctor).OrderBy(d => d.Disease);


            var result = patients.Select(patient => new PatientDto
            {
                Id = patient.Id,
                Name=patient.Name,
                Age = patient.Age,
                Gender = patient.Gender,
                PhoneNumber = patient.Phone_Number,
                Disease = patient.Disease,
                Doctor=patient.Doctor
            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<PatientDto>(totalCount, result); ;
        }

        public async Task UpdateAsync(CreatePatientDto input)
        {
            try
            {
                var patient = await _patientRepository.GetAsync(input.Id);

                patient.Name = input.Name;
                patient.Age = input.Age;
                patient.Gender = input.Gender;
                patient.Phone_Number = input.PhoneNumber;
                patient.Disease = input.Disease;
                patient.Doctor = input.Doctor;

                await _patientRepository.UpdateAsync(patient);
            }
            catch (Exception xe)
            {

                throw xe;
            }
        }
    }
}
