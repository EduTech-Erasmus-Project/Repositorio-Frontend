import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentViewedRoutingModule } from './student-viewed-routing.module';
import { StudentViewedComponent } from './student-viewed.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { ComponentsModule } from 'src/app/public/components/components.module';


@NgModule({
  declarations: [StudentViewedComponent],
  imports: [
    CommonModule,
    StudentViewedRoutingModule,
    SharedModule,
    ComponentsModule
  ]
})
export class StudentViewedModule { }
