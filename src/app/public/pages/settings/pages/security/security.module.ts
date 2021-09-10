import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityRoutingModule } from './security-routing.module';
import { SecurityComponent } from './security.component';
import { ComponentsModule } from 'src/app/public/components/components.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [SecurityComponent],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    ComponentsModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class SecurityModule { }
