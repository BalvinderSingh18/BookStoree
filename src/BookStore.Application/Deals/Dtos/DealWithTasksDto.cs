using Abp.Domain.Entities;
using BookStore.Tasks.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Deals.Dtos
{
    public class DealWithTasksDto:Entity<int>
    {
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<TaskDto> Tasks { get; set; }
    }
}
