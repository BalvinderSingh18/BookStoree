using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Deals
{
    public class Deal:Entity<int>
    {
        public string Name { get; set; }
        public DateTime Created_Date { get; set; }
    }
}
