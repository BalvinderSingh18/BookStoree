using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Books.Dtos
{
    public class GetAllAccountsInput:PagedAndSortedResultRequestDto
    {
        public string Keyword { get; set; }
    }
}
