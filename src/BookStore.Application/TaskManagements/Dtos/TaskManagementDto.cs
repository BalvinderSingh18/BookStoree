using Abp.Domain.Entities;
using System;
using BookStore.TaskManagments;

namespace BookStore.TaskManagements.Dtos
{
    public class TaskManagementDto:Entity<int>
    {
        public int? TenantId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Discussion { get; set; }
        public long AssignedUserId { get; set; }
        public string UserName { get; set; }
        public TaskStatus TaskStatus { get; set; }
        public DateTime Creation_Time { get; set; }
    }
}
