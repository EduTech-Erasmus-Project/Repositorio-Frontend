import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit {
  public items: MenuItem[];
  //private subscription: Subscription;
  private path: string;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
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
        label: 'eXeLearning',
        routerLink: "eXeLearning",
      },
      {
        label: await this.languageService.translate.get('buttons.introduction').toPromise(),
        routerLink: "introduction",
      },
      {
        label: await this.languageService.translate.get('buttons.searchOa').toPromise(),
        routerLink: "search-public",
      },
      {
        label: await this.languageService.translate.get('buttons.profileRegister').toPromise(),
        routerLink: "registration-profile",
      },
    ];

    this.activeIndex = this.items.findIndex(
      (item) => item.routerLink === this.path
    );
  }
  
  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: await this.languageService.translate.get('menu.userGuide').toPromise(), routerLink: ["/guide"] },
    ]);
  }

  public prevPage() {
    this.activeIndex -= 1;
    this.router.navigate([`/guide/${this.items[this.activeIndex].routerLink}`]);
  }

  public nextPage() {
    this.activeIndex += 1;
    this.router.navigate([`/guide/${this.items[this.activeIndex].routerLink}`]);
  }


}
