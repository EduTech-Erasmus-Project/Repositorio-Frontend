import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DevelopersComponent } from './developers.component';

const routes: Routes = [
  { 
    path: '', component: DevelopersComponent,
    data: {
      breadcrumb: null
    },
    
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevelopersRoutingModule { }
