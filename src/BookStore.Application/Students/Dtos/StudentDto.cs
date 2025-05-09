using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Students.Dtos
{
    public class StudentDto:Entity<int>
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Address { get; set; }
        public Gender Gender { get; set; }
        [Required]
        public DateTime Dob { get; set; }
        [Required]
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public int CountryId { get; set; }
        public string CountryName { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }
        public int CityId { get; set; }
        public string CityName { get; set; }
    }
}
