import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserLocationFieldsComponent } from '../../../../../shared/user-location-fields/user-location-fields.component';


@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    UserLocationFieldsComponent
  ]
})
export class ProfileModule { }
