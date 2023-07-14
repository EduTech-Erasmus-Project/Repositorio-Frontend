import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevelopersRoutingModule } from './developers-routing.module';
import { DevelopersComponent } from './developers.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [DevelopersComponent],
  imports: [
    CommonModule,
    DevelopersRoutingModule,
    SharedModule
  ]
})
export class DevelopersModule { }
