using Abp.Authorization;
using Abp.Localization;
using Abp.MultiTenancy;

namespace BookStore.Authorization
{
    public class BookStoreAuthorizationProvider : AuthorizationProvider
    {
        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            context.CreatePermission(PermissionNames.Pages_Users, L("Users"));
            context.CreatePermission(PermissionNames.Pages_Users_Activation, L("UsersActivation"));
            context.CreatePermission(PermissionNames.Pages_Roles, L("Roles"));
            context.CreatePermission(PermissionNames.Pages_Tenants, L("Tenants"), multiTenancySides: MultiTenancySides.Host);

            var taskManagement = context.CreatePermission(
    AppPermissions.Pages_TaskManagement,
    L("TaskManagement")
);

            taskManagement.CreateChildPermission(AppPermissions.Pages_TaskManagement_Create, L("CreateTask"));
            taskManagement.CreateChildPermission(AppPermissions.Pages_TaskManagement_Edit, L("EditTask"));
            taskManagement.CreateChildPermission(AppPermissions.Pages_TaskManagement_Delete, L("DeleteTask"));
            taskManagement.CreateChildPermission(AppPermissions.Pages_TaskManagement_View, L("ViewTask"));
            taskManagement.CreateChildPermission(AppPermissions.Pages_TaskManagement_Admin, L("Discussion Admin Only"));
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, BookStoreConsts.LocalizationSourceName);
        }
    }
}
