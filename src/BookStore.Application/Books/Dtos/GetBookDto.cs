using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Books.Dtos
{
    public class GetBookDto:Entity<int>
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Author { get; set; }
        public DateTime PublishedDate { get; set; }
        [Required]
        public decimal price { get; set; }
    }
}
