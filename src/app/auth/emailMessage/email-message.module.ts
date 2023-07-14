import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailMessageRoutingModule } from './email-message-routing.module';
import { EmailMessageComponent } from './email-message.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [EmailMessageComponent],
  imports: [
    CommonModule,
    EmailMessageRoutingModule,
    SharedModule
  ]
})
export class EmailMessageModule { }
