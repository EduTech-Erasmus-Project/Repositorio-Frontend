import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { StudentViewedComponent } from "./student-viewed.component";

const routes: Routes = [
  {
    path: "",
    component: StudentViewedComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentViewedRoutingModule {}
