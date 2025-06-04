using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.FileUploads.Dtos
{
    public class CreateFileUploadDto:Entity<int>
    {
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public byte[]? FileContent { get; set; }
    }
}
