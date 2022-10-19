import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroductionComponent } from './components/introduction/introduction.component';
import { RegistrationProfileComponent } from './components/registration-profile/registration-profile.component';
import { SearchPublicComponent } from './components/search-public/search-public.component';

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
    {
      path: "search-public",
      component: SearchPublicComponent,
      data: {
        breadcrumb: "Busqueda de OAs",
      },
    },
    {
      path: "registration-profile",
      component: RegistrationProfileComponent,
      data: {
        breadcrumb: "Registrarse con un perfil",
      },
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuideRoutingModule { }
