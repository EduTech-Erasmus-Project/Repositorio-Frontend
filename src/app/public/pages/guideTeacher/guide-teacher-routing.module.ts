import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyObjectsComponent } from './components/my-objects/my-objects.component';
import { UploadFileAdaptedComponent } from './components/upload-file-adapted/upload-file-adapted.component';
import { UploadFileComponent } from './components/upload-file/upload-file.component';

import { GuideTeacherComponent } from './guide-teacher.component';

const routes: Routes = [{
  path: '', component: GuideTeacherComponent, data: {
    breadcrumb: null,
  },
  children: [
    {
      path: "uploadfile",
      component: UploadFileComponent,
      data: {
        breadcrumb: "Cargar Objeto de Aprendizaje",
      },
    },
    {
      path: "uploadfile-adapted",
      component: UploadFileAdaptedComponent,
      data: {
        breadcrumb: "Cargar Objeto de Aprendizaje Adaptado",
      },
    },
    {
      path: "my-objects",
      component: MyObjectsComponent,
      data: {
        breadcrumb: "Mis objetos de aprendizaje",
      },
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuideTeacherRoutingModule { }
