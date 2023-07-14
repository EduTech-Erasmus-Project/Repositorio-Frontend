import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-exelearning',
  templateUrl: './exelearning.component.html',
  styleUrls: ['./exelearning.component.scss']
})
export class ExelearningComponent implements OnInit {

  constructor(
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) { 
    this.add_breadcrumb();
  }

  ngOnInit(): void {
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      {label: await this.languageService.translate.get('menu.userGuide').toPromise()},
      { label: 'eXeLearning', routerLink: ["/guide/eXeLearning"]},
    ]);
  }

}
