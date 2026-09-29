import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuideTeacherRoutingModule } from './guide-teacher-routing.module';
import { GuideTeacherComponent } from './guide-teacher.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UploadFileComponent } from './components/upload-file/upload-file.component';
import { MyObjectsComponent } from './components/my-objects/my-objects.component';
import { UploadFileAdaptedComponent } from './components/upload-file-adapted/upload-file-adapted.component';


@NgModule({
  declarations: [GuideTeacherComponent, UploadFileComponent, MyObjectsComponent, UploadFileAdaptedComponent],
  imports: [
    CommonModule,
    GuideTeacherRoutingModule,
    SharedModule
  ]
})
export class GuideTeacherModule { }
