import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import {SkeletonModule} from 'primeng/skeleton';
import {SplitterModule} from 'primeng/splitter';
import {PanelModule} from 'primeng/panel';
import {TabViewModule} from 'primeng/tabview';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import { SharedModule } from 'src/app/shared/shared.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    AvatarModule,
    SkeletonModule,
    SplitterModule,
    PanelModule,
    TabViewModule,
    DialogModule,
    ButtonModule,
    SharedModule,
    ComponentsModule
  ]
})
export class ReportsModule { }