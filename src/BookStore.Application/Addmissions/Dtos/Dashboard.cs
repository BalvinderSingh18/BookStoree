using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Addmissions.Dtos
{
    public class Dashboard
    {
        public int TotalBeds { get; set; }
        public int AvailableBeds { get; set; }
        public int OccupiedBeds { get; set; }
        public int CurrentAdmittedPatients { get; set; }
        public bool LowAvailabilityAlert { get; set; }
    }
}
