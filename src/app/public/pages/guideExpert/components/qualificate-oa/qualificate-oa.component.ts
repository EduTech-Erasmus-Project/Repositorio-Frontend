import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-qualificate-oa',
  templateUrl: './qualificate-oa.component.html',
  styleUrls: ['./qualificate-oa.component.scss']
})
export class QualificateOaComponent implements OnInit {

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
      { label: await this.languageService.translate.get('menu.expertGuide').toPromise() },
      { label: await this.languageService.translate.get('menu.sideMenu.qualificateOa').toPromise(), routerLink: ["/guideTeacher/uploadfile"] }
    ]);
  }

}
