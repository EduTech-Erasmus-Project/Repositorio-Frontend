import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RecommendedComponent } from "./recommended.component";

const routes: Routes = [
  {
    path: "",
    component: RecommendedComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecommendedRoutingModule {}
