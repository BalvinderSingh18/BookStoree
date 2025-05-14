using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Deals.Dtos
{
    public class CreateDealDto:Entity<int>
    {
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
