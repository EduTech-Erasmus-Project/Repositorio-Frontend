import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditObjectRoutingModule } from './edit-object-routing.module';
import { EditObjectComponent } from './edit-object.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';


@NgModule({
  declarations: [EditObjectComponent],
  imports: [
    CommonModule,
    EditObjectRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    ComponentsModule
  ]
})
export class EditObjectModule { }
