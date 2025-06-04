using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;

namespace BookStore.Books
{
    public class Book:FullAuditedEntity, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Author { get; set; }
        public DateTime PublishedDate { get; set; }
        [Required]
        public decimal price { get; set; }
    }
}
