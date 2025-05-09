using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Beds.Dtos;
using BookStore.Books.Dtos;
using BookStore.Students;
using BookStore.Students.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Beds
{
    public class BedAppService : ApplicationService, IBedAppService
    {
        private readonly IRepository<Bed> _bedRepository;
        public BedAppService(IRepository<Bed> bedRepository)
        {
                _bedRepository = bedRepository; 
        }
        public async Task CreateAsync(CreateBedDto input)
        {
            try
            {
                var bed = new Bed
                {
                    bed_Number = input.BedNumber,
                    Type = input.Type,
                    Status = input.Status,
                };
                await _bedRepository.InsertAsync(bed);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            await _bedRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<BedDto>> GetAll(GetAllAccountsInput input)
       {
            var query = _bedRepository.GetAll();

            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(d =>
                d.bed_Number.Contains(input.Keyword));
            }
           // query = !string.IsNullOrWhiteSpace(input.Sorting) ? query.OrderBy(input.Sorting) : query.OrderBy(d => d.bed_Number);
            var beds = await query.ToListAsync();

            var result = beds.Select(bed => new BedDto
            {
                Id = bed.Id,
                BedNumber = bed.bed_Number,
                Type = bed.Type,
                Status = bed.Status,
            }).ToList();
            var totalCount = result.Count;
            return new PagedResultDto<BedDto>(totalCount, result);
        }

        public async Task UpdateAsync(CreateBedDto input)
        {
            try
            {
                var bed = await _bedRepository.GetAsync(input.Id);

                bed.bed_Number = input.BedNumber;
                bed.Type = input.Type;
                bed.Status = input.Status;

                await _bedRepository.UpdateAsync(bed);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
    }
}
