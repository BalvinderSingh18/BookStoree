using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Beds.Dtos
{
    public class CreateBedDto:Entity<int>
    {
        [Required]
        public string BedNumber { get; set; }
        [Required]
        public Type Type { get; set; }
        [Required]
        public Status Status { get; set; }
    }
}
