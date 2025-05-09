using Abp.Domain.Entities;
using BookStore.Beds;
using BookStore.Patients;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Addmissions.Dtos
{
    public class AddmissionDto:Entity<int>
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public int BedId { get; set; }
        public string BedNumber { get; set; }
        public DateTime AdmitDate { get; set; }
        public DateTime? DischargeDate { get; set; }
        public string? Notes { get; set; }
    }
}
