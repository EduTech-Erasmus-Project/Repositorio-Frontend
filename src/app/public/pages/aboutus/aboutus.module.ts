import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutusRoutingModule } from './aboutus-routing.module';
import { AboutusComponent } from './aboutus.component';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
  declarations: [AboutusComponent],
  imports: [
    CommonModule,
    AboutusRoutingModule,
    SharedModule
  ]
})
export class AboutusModule { }
