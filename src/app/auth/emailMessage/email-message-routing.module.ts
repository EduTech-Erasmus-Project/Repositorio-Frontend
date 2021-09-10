import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmailMessageComponent } from './email-message.component';

const routes: Routes = [{ path: '', component: EmailMessageComponent,data: {
  breadcrumb: null
}, }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailMessageRoutingModule { }
