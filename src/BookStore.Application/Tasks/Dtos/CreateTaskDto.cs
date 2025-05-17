using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Tasks.Dtos
{
    public class CreateTaskDto:Entity<int>
    {
        public string Task_Number { get; set; }
        public string Title { get; set; }
        public DateTime Date_From { get; set; }
        public DateTime To_Date { get; set; }
        public string Description { get; set; }
        public int DealId { get; set; }
    }
}
