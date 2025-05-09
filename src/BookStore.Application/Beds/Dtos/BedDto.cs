using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Beds.Dtos
{
    public class BedDto:Entity<int>
    {
        public string BedNumber { get; set; }
        public Type Type { get; set; }
        public Status Status { get; set; }
    }
}
