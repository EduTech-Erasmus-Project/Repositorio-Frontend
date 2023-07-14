import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-my-objects',
  templateUrl: './my-objects.component.html',
  styleUrls: ['./my-objects.component.scss']
})
export class MyObjectsComponent implements OnInit {

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
      { label: await this.languageService.translate.get('menu.teacherGuide').toPromise() },
      { label: await this.languageService.translate.get('buttons.viewMyOa').toPromise(), routerLink: ["/guideTeacher/my-objects"] }
    ]);
  }

}
