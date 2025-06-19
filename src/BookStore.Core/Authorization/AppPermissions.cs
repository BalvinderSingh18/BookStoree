using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Authorization
{
    public static class AppPermissions
    {
        

        public const string Pages_TaskManagement = "Pages.TaskManagement";
        public const string Pages_TaskManagement_Admin = "Pages.TaskManagement.Admin";

        public const string Pages_TaskManagement_Create = "Pages.TaskManagement.Create";
        public const string Pages_TaskManagement_Edit = "Pages.TaskManagement.Edit";
        public const string Pages_TaskManagement_Delete = "Pages.TaskManagement.Delete";
        public const string Pages_TaskManagement_View = "Pages.TaskManagement.View";
    }
}
