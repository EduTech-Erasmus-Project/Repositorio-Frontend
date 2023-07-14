import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ComponentsModule } from 'src/app/public/components/components.module';
import { MyObjectsComponent } from '../myObjects/my-objects.component';
import { MyQualifiedOaComponent } from './my-qualified-oa.component';
import { MyQualifieldOaRoutingModule } from './my-qualifield-oa-routing.module';



@NgModule({
  declarations: [MyQualifiedOaComponent],
  imports: [
    CommonModule,
    MyQualifieldOaRoutingModule,
    SharedModule,
    ComponentsModule
  ]
})
export class MyQualifiedOaModule { }
