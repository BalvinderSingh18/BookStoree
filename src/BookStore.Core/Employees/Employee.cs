using Abp.Domain.Entities;
using BookStore.Departments;
using BookStore.Students;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Employees
{
    public class Employee:Entity<int>
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Address { get; set; }
        [Required]
        public string Phone_Number { get; set; }
        [Required]
        public Gender Gender { get; set; }
        [Required]
        public DateTime Dob { get; set; }
        [Required]
        public int DepartmentId { get; set; }
        public Department Department { get; set; }
    }
}
