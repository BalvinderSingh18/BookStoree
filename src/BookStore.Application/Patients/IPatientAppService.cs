using Abp.Application.Services;
using Abp.Application.Services.Dto;
using BookStore.Books.Dtos;
using BookStore.Patients.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Patients
{
    public interface IPatientAppService:IApplicationService
    {
        Task<PagedResultDto<PatientDto>> GetAll(GetAllAccountsInput getAllAccountsInput);
        Task CreateAsync(CreatePatientDto input);
        Task UpdateAsync(CreatePatientDto input);
        Task DeleteAsync(EntityDto<int> input);
    }
}
