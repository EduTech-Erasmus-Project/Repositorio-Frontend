import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QualificationByMyComponent } from './components/qualification-by-my/qualification-by-my.component';
import { QualificationOaComponent } from './components/qualification-oa/qualification-oa.component';
import { SeenByMeComponent } from './components/seen-by-me/seen-by-me.component';

import { GuideStudentComponent } from './guide-student.component';

const routes: Routes = [
  {
    path: '', component: GuideStudentComponent,
    data: {
      breadcrumb: null,
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "qualifications",
  
      },
      {
        path: 'qualifications',
        component: QualificationOaComponent
      },
      {
        path: 'qualification-by-me',
        component: QualificationByMyComponent
      },
      {
        path: 'seen-by-me',
        component: SeenByMeComponent
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuideStudentRoutingModule { }
