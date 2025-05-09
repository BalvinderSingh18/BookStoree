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
    public class PatientDto:Entity<int>
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public Gender Gender { get; set; }
        public string PhoneNumber { get; set; }
        public string Disease { get; set; }
        public string Doctor { get; set; }
    }
}
