using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.States.Dtos
{
    public class CreateStateDto : Entity<int>
    {
        public string Name { get; set; }
        public int CountryId { get; set; }
    }
}
