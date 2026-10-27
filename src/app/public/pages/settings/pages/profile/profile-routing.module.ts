import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { UnsavedChangesGuard } from "src/app/guards/unsaved-changes.guard";
import { ProfileComponent } from "./profile.component";

const routes: Routes = [
  {
    path: "",
    component: ProfileComponent,
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
export class ProfileRoutingModule {}
