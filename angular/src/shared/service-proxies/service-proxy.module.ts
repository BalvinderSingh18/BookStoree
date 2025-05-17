import { NgModule } from "@angular/core";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AbpHttpInterceptor } from "abp-ng2-module";

import * as ApiServiceProxies from "./service-proxies";

@NgModule({
  providers: [
    ApiServiceProxies.RoleServiceProxy,
    ApiServiceProxies.CourseServiceProxy,
    ApiServiceProxies.StudentServiceProxy,
    ApiServiceProxies.CountryServiceProxy,
    ApiServiceProxies.StateServiceProxy,
    ApiServiceProxies.CityServiceProxy,
    ApiServiceProxies.BookServiceProxy,
    ApiServiceProxies.BedServiceProxy,
    ApiServiceProxies.PatientServiceProxy,
    ApiServiceProxies.AddmissionServiceProxy,
    ApiServiceProxies.FileUploadServiceProxy,
    ApiServiceProxies.DepartmentServiceProxy,
    ApiServiceProxies.EmployeeServiceProxy,
    ApiServiceProxies.DealServiceProxy,
    ApiServiceProxies.SessionServiceProxy,
    ApiServiceProxies.TenantServiceProxy,
    ApiServiceProxies.UserServiceProxy,
    ApiServiceProxies.TokenAuthServiceProxy,
    ApiServiceProxies.AccountServiceProxy,
    ApiServiceProxies.ConfigurationServiceProxy,
    { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true },
  ],
})
export class ServiceProxyModule {}
