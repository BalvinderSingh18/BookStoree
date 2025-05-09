using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Addmissions.Dtos
{
    public class CreateAddmissionDto:Entity<int>
    {
        [Required]
        public int PatientId { get; set; }
        [Required]
        public int BedId { get; set; }
        [Required]
        public DateTime AdmitDate { get; set; }
        public DateTime? DischargeDate { get; set; }
        public string? Notes { get; set; }
    }
}
