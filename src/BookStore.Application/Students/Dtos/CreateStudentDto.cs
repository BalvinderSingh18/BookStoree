using Abp.Domain.Entities;
using BookStore.Courses;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Students.Dtos
{
    public class CreateStudentDto:Entity<int>
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Address { get; set; }
        [Required]
        public Gender Gender { get; set; }
        [Required]
        public DateTime Dob { get; set; }
        [Required]
        public int CourseId { get; set; }
        public int CountryId { get; set; }
        public int StateId { get; set; }
        public int CityId { get; set; }
        
    }
}
