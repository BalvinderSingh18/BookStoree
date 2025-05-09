using Abp.Domain.Entities;
using BookStore.Cities;
using BookStore.Countries;
using BookStore.Courses;
using BookStore.States;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Students
{
    public class Student:Entity<int>
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Address { get; set; }
        [Required]
        public Gender Gender { get; set; }
        [Required]
        public DateTime Dob { get; set; }
        [ForeignKey("CourseId")]
        [Required]
        public int CourseId { get; set; }
        public Course Course { get; set; }
        [ForeignKey("CountryId")]
        [Required]
        public int? CountryId { get; set; }
        public Country Country { get; set; }
        [ForeignKey("StateId")]
        [Required]
        public int? StateId { get; set; }
        public State State { get; set; }
        [ForeignKey("CityId")]
        [Required]
        public int? CityId { get; set; }
        public City City { get; set; }
    }
}
