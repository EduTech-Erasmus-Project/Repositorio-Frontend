import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ObjectRoutingModule } from './object-routing.module';
import { ObjectComponent } from './object.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ComponentsModule } from '../../components/components.module';
import { ViewEvaluacionsComponent } from '../../components/view-evaluacions/view-evaluacions.component';


@NgModule({
  declarations: [ObjectComponent],
  imports: [
    CommonModule,
    ObjectRoutingModule,
    SharedModule,
    ComponentsModule
    
  ]
})
export class ObjectModule { }
