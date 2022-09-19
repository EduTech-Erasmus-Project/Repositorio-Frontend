import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuideRoutingModule } from './guide-routing.module';
import { GuideComponent } from './guide.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { IntroductionComponent } from './components/introduction/introduction.component';


@NgModule({
  declarations: [GuideComponent, IntroductionComponent],
  imports: [
    CommonModule,
    GuideRoutingModule,
    SharedModule
  ]
})
export class GuideModule { }
