using Abp.Domain.Entities;
using Castle.MicroKernel.Registration;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Beds
{
    public class Bed:Entity<int>
    {
        [Required]
        [StringLength(50)]
        public string bed_Number { get; set; }
        [Required]
        public Type Type  { get; set; }
        [Required]
        public Status Status { get; set; }
    }
}
