using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Departments.Dtos
{
    public class DepartmentDto:Entity<int>
    {
        public string Name { get; set; }
    }
}
