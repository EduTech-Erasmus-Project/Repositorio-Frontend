import { Component, OnInit, OnDestroy } from "@angular/core";
import { LanguageService } from "../../../services/language.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { QuerySearch } from "src/app/core/interfaces/Search";
import { Subscription } from "rxjs";
import { LearningObjectService } from "../../../services/learning-object.service";
import { LoginService } from "../../../services/login.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  public populars: ObjectLearning[];
  public translate: TranslateService;
  public objects: ObjectLearning[];
  public loading: boolean = false;
  public queryParams: QuerySearch = {};
  private subscribes: Subscription[] = [];

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private objectService: LearningObjectService,
    private loginService: LoginService, 
    private breadcrumbService: BreadcrumbService
  ) {
    this.add_breadcrumb();
  }
  ngOnDestroy(): void {
    this.subscribes.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  private async add_breadcrumb(){
    this.breadcrumbService.setItems([
      {label: "ROA"},
      { label: await this.languageService.translate.get('menu.home').toPromise(), routerLink: ["/"] },
    ]);
  }

  get userRole() {
    return this.loginService.validateRole("student");
  }

  ngOnInit(): void {
    this.translate = this.languageService.translate;
    this.loadData();
  }

  loadData() {
    let popularsSub = this.objectService.getPopulars().subscribe((res) => {
      this.populars =
        res.map((res) => {
          return {
            ...res.learning_object,
            rating: res.rating,
          };
        }) || [];
    });
    this.subscribes.push(popularsSub);
  }

  onNavegateTo(route: string) {
    this.router.navigate([route]);
  }
}
