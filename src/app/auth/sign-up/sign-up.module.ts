import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignUpRoutingModule } from './sign-up-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SignUpComponent } from './sign-up.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';

@NgModule({
  declarations: [SignUpComponent],
  imports: [
    CommonModule,
    SignUpRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  
  bootstrap: [AppComponent]
})
export class SignUpModule { }
