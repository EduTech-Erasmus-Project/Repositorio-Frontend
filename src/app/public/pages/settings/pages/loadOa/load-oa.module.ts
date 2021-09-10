import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadOaRoutingModule } from './load-oa-routing.module';
import { LoadOaComponent } from './load-oa.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [LoadOaComponent],
  imports: [
    CommonModule,
    LoadOaRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class LoadOaModule { }
