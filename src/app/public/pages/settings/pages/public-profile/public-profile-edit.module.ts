import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

import { PublicProfileEditRoutingModule } from "./public-profile-edit-routing.module";
import { PublicProfileEditComponent } from "./public-profile-edit.component";
import { SharedModule } from "../../../../../shared/shared.module";

@NgModule({
  declarations: [PublicProfileEditComponent],
  imports: [
    CommonModule,
    PublicProfileEditRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class PublicProfileEditModule {}
