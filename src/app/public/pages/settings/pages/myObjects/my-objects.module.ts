import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyObjectsRoutingModule } from './my-objects-routing.module';
import { MyObjectsComponent } from './my-objects.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { ComponentsModule } from 'src/app/public/components/components.module';


@NgModule({
  declarations: [MyObjectsComponent],
  imports: [
    CommonModule,
    MyObjectsRoutingModule,
    SharedModule,
    ComponentsModule
  ]
})
export class MyObjectsModule { }
