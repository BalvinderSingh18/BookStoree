import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AccountComponent } from './account.component';
import { SelectEditionComponent } from './register/select-edition.component';
 
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AccountComponent,
        children: [
          { path: 'login', component: LoginComponent },
          { path: 'register', component: RegisterComponent },
          // Don't put select-edition here 👇
        ]
      },
      // This is now outside of AccountComponent
      { path: 'select-edition', component: SelectEditionComponent }
    ])
  ],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
 
 