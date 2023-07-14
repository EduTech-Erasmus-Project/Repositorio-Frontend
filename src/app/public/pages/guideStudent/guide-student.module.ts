import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuideStudentRoutingModule } from './guide-student-routing.module';
import { GuideStudentComponent } from './guide-student.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { QualificationOaComponent } from './components/qualification-oa/qualification-oa.component';
import { SeenByMeComponent } from './components/seen-by-me/seen-by-me.component';
import { QualificationByMyComponent } from './components/qualification-by-my/qualification-by-my.component';


@NgModule({
  declarations: [GuideStudentComponent, QualificationOaComponent, SeenByMeComponent, QualificationByMyComponent],
  imports: [
    CommonModule,
    GuideStudentRoutingModule,
    SharedModule
  ]
})
export class GuideStudentModule { }
