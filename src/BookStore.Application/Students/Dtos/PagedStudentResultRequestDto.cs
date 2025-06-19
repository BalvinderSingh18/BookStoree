using Abp.Application.Services.Dto;

namespace BookStore.Students.Dtos
{
    public class PagedStudentResultRequestDto : PagedResultRequestDto
    {
        public string Keyword { get; set; }
        public bool? IsActive { get; set; }
    }
}
