import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "/",
  },
  {
    path: ":slug",
    component: ReportsComponent,
    data: {
      breadcrumb: null
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }