using Abp.Domain.Entities;
using BookStore.Countries;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.States
{
    public class State:Entity<int>
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public int CountryId { get; set; }
        public Country Country  { get; set; }
    }
}
