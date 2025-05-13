using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.FileUploads
{
    public class FileUpload:Entity<int>
    {
        public string File_Name { get; set; }
        public string File_Path { get; set; }
    }
}
