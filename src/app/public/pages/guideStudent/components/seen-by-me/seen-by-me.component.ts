import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-seen-by-me',
  templateUrl: './seen-by-me.component.html',
  styleUrls: ['./seen-by-me.component.scss']
})
export class SeenByMeComponent implements OnInit {

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
      { label: await this.languageService.translate.get('menu.studentGuide').toPromise() },
      { label: await this.languageService.translate.get('menu.sideMenu.ratedMe').toPromise(), routerLink: ["/guideTeacher/uploadfile"] }
    ]);
  }
  
}
