import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { ComponentsModule } from '../../components/components.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    SearchRoutingModule,
    ComponentsModule,
    SharedModule
  ]
})
export class SearchModule { }
