import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoadOaComponent } from "./load-oa.component";

const routes: Routes = [
  {
    path: "",
    component: LoadOaComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadOaRoutingModule {}
