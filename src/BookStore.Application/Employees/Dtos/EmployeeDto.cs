using Abp.Domain.Entities;
using BookStore.Departments;
using BookStore.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Employees.Dtos
{
    public class EmployeeDto:Entity<int>
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public Gender Gender { get; set; }
        public DateTime Dob { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
    }
}
