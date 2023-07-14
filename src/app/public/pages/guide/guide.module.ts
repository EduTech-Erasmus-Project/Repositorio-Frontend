import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuideRoutingModule } from './guide-routing.module';
import { GuideComponent } from './guide.component';
import { IntroductionComponent } from './components/introduction/introduction.component';
import { SearchPublicComponent } from './components/search-public/search-public.component';
import { RegistrationProfileComponent } from './components/registration-profile/registration-profile.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExelearningComponent} from './components/exelearning/exelearning.component'

@NgModule({
  declarations: [
    GuideComponent, 
    IntroductionComponent, 
    SearchPublicComponent, 
    RegistrationProfileComponent,
    ExelearningComponent
  ],
  imports: [
    CommonModule,
    GuideRoutingModule,
    SharedModule
  ]
})
export class GuideModule { }
