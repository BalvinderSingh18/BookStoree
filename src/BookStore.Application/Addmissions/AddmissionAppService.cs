using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Addmissions.Dtos;
using BookStore.Beds;
using BookStore.Books.Dtos;
using BookStore.Students.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Addmissions
{
    public class AddmissionAppService : ApplicationService, IAddmissionAppService
    {
        private readonly IRepository<Addmission> _addmissionRepository;
        public AddmissionAppService(IRepository<Addmission> addmissionRepository)
        {
            _addmissionRepository = addmissionRepository;
        }
        public async Task CreateAsync(CreateAddmissionDto input)
        {
            try
            {
                var addmission = new Addmission
                {
                    PatientId = input.PatientId,
                    BedId = input.BedId,
                    Admit_Date = input.AdmitDate,
                    Discharge_Date = input.DischargeDate,
                    Notes = input.Notes,
                };
                await _addmissionRepository.InsertAsync(addmission);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _addmissionRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<AddmissionDto>> GetAll(GetAllAccountsInput input)
        {
            var query = _addmissionRepository.GetAllIncluding(s => s.Patient, s => s.Bed);

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.Bed.bed_Number.ToString().Contains(input.Keyword) ||
                d.Patient.Name.Contains(input.Keyword) ||
                d.Admit_Date.ToString().Contains(input.Keyword) ||
                d.Discharge_Date.ToString().Contains(input.Keyword) ||
                d.Notes.Contains(input.Keyword));
            }
            //query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.Patient.Name).OrderBy(d => d.Bed.bed_Number).OrderBy(d => d.Admit_Date).OrderBy(d => d.Discharge_Date);
            var addmissions = await query.ToListAsync();

            var result = addmissions.Select(addmission => new AddmissionDto
            {
                Id = addmission.Id,
                PatientId = addmission.PatientId,
                PatientName = addmission.Patient.Name,
                BedId = addmission.BedId,
                BedNumber = addmission.Bed.bed_Number,
                AdmitDate=addmission.Admit_Date,
                DischargeDate=addmission.Discharge_Date,
                Notes = addmission.Notes,
            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<AddmissionDto>(totalCount, result);
        }

        public async Task UpdateAsync(CreateAddmissionDto input)
        {
            try
            {
                var addmission = await _addmissionRepository.GetAsync(input.Id);

                addmission.PatientId = input.PatientId;
                addmission.BedId = input.BedId;
                addmission.Admit_Date = input.AdmitDate;
                addmission.Discharge_Date = input.DischargeDate;
                addmission.Notes = input.Notes;

                await _addmissionRepository.UpdateAsync(addmission);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
