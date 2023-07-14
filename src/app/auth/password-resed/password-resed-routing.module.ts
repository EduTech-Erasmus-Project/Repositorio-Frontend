import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordResedComponent } from './password-resed.component';

const routes: Routes = [{
   path: '', component: PasswordResedComponent,
   data: {
    breadcrumb: null
  },
   }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PasswordResedRoutingModule { }
