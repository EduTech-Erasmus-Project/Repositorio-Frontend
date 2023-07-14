import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

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
      { label: await this.languageService.translate.get('buttons.uploadOa').toPromise(), routerLink: ["/guideTeacher/uploadfile"] }
    ]);
  }
}
