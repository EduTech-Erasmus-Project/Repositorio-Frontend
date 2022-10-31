import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuideExpertRoutingModule } from './guide-expert-routing.module';
import { GuideExpertComponent } from './guide-expert.component';
import { QualificateOaComponent } from './components/qualificate-oa/qualificate-oa.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [GuideExpertComponent, QualificateOaComponent],
  imports: [
    CommonModule,
    GuideExpertRoutingModule,
    SharedModule
  ]
})
export class GuideExpertModule { }
