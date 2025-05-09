using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Countries
{
    public class Country:Entity<int>
    {
        [Required]
        public string Name { get; set; }
    }
}
