import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QualificateOaComponent } from './components/qualificate-oa/qualificate-oa.component';
import { GuideExpertComponent } from './guide-expert.component';

const routes: Routes = [
  { 
    path: '', 
    component: GuideExpertComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "expert-evaluation",
      },
      {
        path: "expert-evaluation",
        component: QualificateOaComponent
      }
    ] 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuideExpertRoutingModule { }
