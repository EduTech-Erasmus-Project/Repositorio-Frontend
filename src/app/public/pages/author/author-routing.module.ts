import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthorComponent } from "./author.component";

const routes: Routes = [
  {
    path: ":userKey",
    component: AuthorComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthorRoutingModule {}
