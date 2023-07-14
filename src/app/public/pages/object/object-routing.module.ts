import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ObjectComponent } from "./object.component";

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "/",
  },
  {
    path: ":slug",
    component: ObjectComponent,
    data: {
      breadcrumb: null
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ObjectRoutingModule {}
