import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { ComponentsModule } from './components/components.module';
import { SharedModule } from 'primeng/api';


@NgModule({
  declarations: [SettingsComponent,],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    ComponentsModule,
    SharedModule
  ]
})
export class SettingsModule { }
