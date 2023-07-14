import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-guide-student',
  templateUrl: './guide-student.component.html',
  styleUrls: ['./guide-student.component.scss']
})
export class GuideStudentComponent implements OnInit {

  public items: MenuItem[];
  private path: string;
  public activeIndex: number = 0;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) { 
    this.path = this.route.snapshot.firstChild.url[0].path;
    this.add_breadcrumb();
  }

  ngOnInit(): void {
    this.add_items();
  }

  private async add_items(){
    this.items = [
      {
        label: await this.languageService.translate.get('guideStudent.steps.qualifications').toPromise(),
        routerLink: "qualifications",
      },
      {
        label: await this.languageService.translate.get('guideStudent.steps.qualificationsByMe').toPromise(),
        routerLink: "qualification-by-me",
      },
      {
        label: await this.languageService.translate.get('guideStudent.steps.seeByMe').toPromise(),
        routerLink: "seen-by-me",
      },
    ];

    this.activeIndex = this.items.findIndex(
      (item) => item.routerLink === this.path
    );
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: await this.languageService.translate.get('menu.studentGuide').toPromise(), routerLink: ["/guideStudent/qualifications"] },
    ]);
  }


  public prevPage() {
    this.activeIndex -= 1;
    this.router.navigate([`/guideStudent/${this.items[this.activeIndex].routerLink}`]);
  }

  public nextPage() {
    this.activeIndex += 1;
    this.router.navigate([`/guideStudent/${this.items[this.activeIndex].routerLink}`]);
  }

  public reset_Page(){
    this.router.navigate(['/guide/registration-profile']);
  }
}
