import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SearchComponent } from "./search.component";

const routes: Routes = [
  {
    path: "",
    component: SearchComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRoutingModule {}
