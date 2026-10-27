import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { UnsavedChangesGuard } from "src/app/guards/unsaved-changes.guard";
import { PublicProfileEditComponent } from "./public-profile-edit.component";

const routes: Routes = [
  {
    path: "",
    component: PublicProfileEditComponent,
    canDeactivate: [UnsavedChangesGuard],
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicProfileEditRoutingModule {}
