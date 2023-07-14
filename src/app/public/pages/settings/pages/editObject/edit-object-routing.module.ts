import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { EditObjectComponent } from "./edit-object.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/settings/my-objects",
    pathMatch: "full",
    data: {
      breadcrumb: null,
    },
  },
  {
    path: ":slug",
    component: EditObjectComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditObjectRoutingModule {}
