import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-email-message',
  templateUrl: './email-message.component.html',
  styleUrls: ['./email-message.component.scss']
})
export class EmailMessageComponent implements OnInit {

  constructor(
    private breadcrumbService:BreadcrumbService,
    private languageService: LanguageService
  ) { 
    this.add_breadcrumb();
  }

  ngOnInit(): void {
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      {label: "ROA"},
      { label: await this.languageService.translate.get('menu.sendLink').toPromise(), routerLink: ["/emailMessage"] },
    ]);
  }

}
