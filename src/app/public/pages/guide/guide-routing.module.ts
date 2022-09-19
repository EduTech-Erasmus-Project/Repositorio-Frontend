import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroductionComponent } from './components/introduction/introduction.component';

import { GuideComponent } from './guide.component';

const routes: Routes = [{
  path: '', component: GuideComponent, data: {
    breadcrumb: null,
  },
  children: [
    {
      path: "introduction",
      component: IntroductionComponent,
      data: {
        breadcrumb: "Introducción",
      },
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuideRoutingModule { }
