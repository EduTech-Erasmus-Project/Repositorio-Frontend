import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-search-public',
  templateUrl: './search-public.component.html',
  styleUrls: ['./search-public.component.scss']
})
export class SearchPublicComponent implements OnInit {

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
      { label: await this.languageService.translate.get('menu.userGuide').toPromise() },
      { label: await this.languageService.translate.get('buttons.searchOa').toPromise(), routerLink: ["/search-public"] },
    ]);
  }
}
