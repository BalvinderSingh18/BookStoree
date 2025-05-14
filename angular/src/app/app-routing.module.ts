import { AddmissionComponent } from './addmission/addmission.component';
import { PatientComponent } from './patient/patient.component';
import { BedComponent } from './bed/bed.component';
import { CityComponent } from "./city/city.component";
import { StateComponent } from "./state/state.component";
import { CountryComponent } from "./country/country.component";
import { StudentComponent } from "./student/student.component";
import { CourseComponent } from "./course/course.component";
import { BookComponent } from "./book/book.component";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AppRouteGuard } from "@shared/auth/auth-route-guard";
import { AppComponent } from "./app.component";
import { FileuploadComponent } from "./fileupload/fileupload.component";
import{DepartmentComponent} from "./department/department.component"
import{EmployeeComponent} from "./employee/employee.component"

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "",
        component: AppComponent,
        children: [
          {
            path: "home",
            loadChildren: () =>
              import("./home/home.module").then((m) => m.HomeModule),
            canActivate: [AppRouteGuard],
          },
          {
            path: "about",
            loadChildren: () =>
              import("./about/about.module").then((m) => m.AboutModule),
            canActivate: [AppRouteGuard],
          },
          {
            path: "users",
            loadChildren: () =>
              import("./users/users.module").then((m) => m.UsersModule),
            data: { permission: "Pages.Users" },
            canActivate: [AppRouteGuard],
          },
          {
            path: "roles",
            loadChildren: () =>
              import("./roles/roles.module").then((m) => m.RolesModule),
            data: { permission: "Pages.Roles" },
            canActivate: [AppRouteGuard],
          },
          {
            path: "tenants",
            loadChildren: () =>
              import("./tenants/tenants.module").then((m) => m.TenantsModule),
            data: { permission: "Pages.Tenants" },
            canActivate: [AppRouteGuard],
          },
          {
            path: "update-password",
            loadChildren: () =>
              import("./users/users.module").then((m) => m.UsersModule),
            canActivate: [AppRouteGuard],
          },
          { path: "book", component: BookComponent },
          { path: "course", component: CourseComponent },
          { path: "student", component: StudentComponent },
          { path: "country", component: CountryComponent },
          { path: "state", component: StateComponent },
          { path: "city", component: CityComponent },
          {path:"bed",component:BedComponent},
          {path:"patient",component:PatientComponent},
          {path:"addmission",component:AddmissionComponent},
          {path:"fileupload",component:FileuploadComponent},
          {path:"department",component:DepartmentComponent},
          {path:"employee",component:EmployeeComponent},
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
