import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MyObjectsComponent } from "./my-objects.component";

const routes: Routes = [
  {
    path: "",
    component: MyObjectsComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyObjectsRoutingModule {}
