import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PasswordResedRoutingModule } from './password-resed-routing.module';
import { PasswordResedComponent } from './password-resed.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [PasswordResedComponent],
  imports: [
    CommonModule,
    PasswordResedRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class  PasswordResedModule { }
