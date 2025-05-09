using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Cities.Dtos
{
    public class CityDto:Entity<int>
    {
        public string Name { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }
        public string CountryName { get; set; }

    }
}
