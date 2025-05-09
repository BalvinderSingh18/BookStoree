using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Cities.Dtos
{
    public class CreateCityDto:Entity<int>
    {
        public string Name { get; set; }
        public int StateId { get; set; }
    }
}
