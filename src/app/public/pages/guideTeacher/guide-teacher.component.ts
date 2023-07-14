import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-guide-teacher',
  templateUrl: './guide-teacher.component.html',
  styleUrls: ['./guide-teacher.component.scss']
})
export class GuideTeacherComponent implements OnInit {

  public items: MenuItem[];
  //private subscription: Subscription;
  private path: string;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
    ) {
    this.path = this.route.snapshot.firstChild.url[0].path;
    this.add_breadcrumb();
  }

  public activeIndex: number = 0;

  ngOnDestroy(): void {
    //this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    //console.log("GuideComponent", this.activeIndex);
    this.add_items();
  }

  private async add_items(){
    this.items = [
      {
        label: await this.languageService.translate.get('buttons.uploadOa').toPromise(),
        routerLink: "uploadfile",
      },
      {
        label: await this.languageService.translate.get('buttons.uploadOaOer').toPromise(),
        routerLink: "uploadfile-adapted",
      },
      {
        label: await this.languageService.translate.get('buttons.viewMyOa').toPromise(),
        routerLink: "my-objects",
      },
    ];

    this.activeIndex = this.items.findIndex(
      (item) => item.routerLink === this.path
    );
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: await this.languageService.translate.get('menu.teacherGuide').toPromise(), routerLink: ["/"] },
    ]);
  }


  public prevPage() {
    this.activeIndex -= 1;
    this.router.navigate([`/guideTeacher/${this.items[this.activeIndex].routerLink}`]);
  }

  public nextPage() {
    this.activeIndex += 1;
    this.router.navigate([`/guideTeacher/${this.items[this.activeIndex].routerLink}`]);
  }

  public reset_Page(){
    this.router.navigate(['/guide/registration-profile']);
  }
}
