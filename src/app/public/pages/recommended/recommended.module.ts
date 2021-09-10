import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecommendedRoutingModule } from './recommended-routing.module';
import { RecommendedComponent } from './recommended.component';
import { SharedModule } from '../../../shared/shared.module';
import { ComponentsModule } from '../../components/components.module';


@NgModule({
  declarations: [RecommendedComponent],
  imports: [
    CommonModule,
    RecommendedRoutingModule,
    SharedModule,
    ComponentsModule
  ]
})
export class RecommendedModule { }
