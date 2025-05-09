using Abp.Domain.Entities;
using BookStore.Students;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Patients.Dtos
{
    public class CreatePatientDto:Entity<int>
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public int Age { get; set; }
        [Required]
        public Gender Gender { get; set; }
        [Required]
        public string PhoneNumber { get; set; }
        [Required]
        public string Disease { get; set; }
        [Required]
        public string Doctor { get; set; }
    }
}
