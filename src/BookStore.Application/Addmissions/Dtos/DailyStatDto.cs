using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Addmissions.Dtos
{
    public class DailyStatDto
    {
        public DateTime Date { get; set; }
        public int Admissions { get; set; }
        public int Discharges { get; set; }
    }
}
