using Abp.Domain.Entities;
using BookStore.States;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Cities
{
    public class City:Entity<int>
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public int StateId { get; set; }
        public State State  { get; set; }
    }
}
