using Abp.Domain.Entities;
using BookStore.Beds;
using BookStore.Patients;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Addmissions
{
    public class Addmission:Entity<int>
    {
        [Required]
        public int PatientId { get; set; }
        public Patient Patient { get; set; }
        [Required]
        public int BedId { get; set; }
        public Bed Bed { get; set; }
        [Required]
        public DateTime Admit_Date { get; set; }
        public DateTime? Discharge_Date { get; set; }
        public string? Notes { get; set; }
    }
}
