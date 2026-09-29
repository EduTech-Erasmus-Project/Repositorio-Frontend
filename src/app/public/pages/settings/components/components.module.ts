import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { SharedModule } from '../../../../shared/shared.module';
import { MenuModule } from 'primeng/menu';
import { EditMetadataComponent } from './edit-metadata/edit-metadata.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';





@NgModule({
  declarations: [SideMenuComponent, EditMetadataComponent],
  imports: [
    CommonModule,
    SharedModule,
    MenuModule,
    ReactiveFormsModule
  ],
  exports:[
    SideMenuComponent,
    EditMetadataComponent
  ]
})
export class ComponentsModule { }
