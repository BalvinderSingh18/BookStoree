using BookStore.TaskManagments;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;
using System;

namespace BookStore.TaskManagements.Dtos
{
    public class CreateTaskManagementDto : Entity<int>
    {
        [Required]
        public string Title { get; set; }

        public string Description { get; set; }
        public string Discussion { get; set; }

        [Required]
        public long AssignedUserId { get; set; }

        public TaskStatus TaskStatus { get; set; }

        public DateTime Creation_Time { get; set; }
    }
}
