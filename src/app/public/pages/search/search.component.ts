import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { SearchService } from "../../../services/search.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";
import { QuerySearchService } from "../../../services/query-search.service";
import { LoginService } from '../../../services/login.service';
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, OnDestroy {
  public title: string;
  private subscribes: Subscription[] = [];
  public preferences: any[] = [];
  public chipsSearch: any[] = [];
  public objects: ObjectLearning[];
  public loading: boolean = false;
  public is_evaluated: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    public querySearchService: QuerySearchService,
    private loginService: LoginService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {

    this.route.queryParams.subscribe((params) => {
      this.querySearchService.queryParams = JSON.parse(JSON.stringify(params));
      this.is_evaluated = params;
      this.add_breadcrumb();
      this.validate_rol_add_chipSearch();
    });
  }

  ngOnInit(): void {
    //console.log("query params", this.querySearchService.queryParams);
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  private async add_breadcrumb() {

    if (!this.loginService.validateRole("expert")) {
      this.breadcrumbService.setItems([
        { label: "ROA" },
        { label: await this.languageService.translate.get('menu.search').toPromise(), routerLink: ["/search"] },
      ]);
    } else {
      let name_label = this.validate_is_evaluate();
      this.breadcrumbService.setItems([
        { label: "ROA" },
        { label: await this.languageService.translate.get('menu.search').toPromise() },
        { label: await name_label, routerLink: ["/search"] },
      ]);
    }
  }

  private async validate_is_evaluate() {
    let name_side: string;
    if (this.is_evaluated.is_evaluated == 'True') {
      name_side = await this.languageService.translate.get('menu.sideMenu.qualified').toPromise();
      return name_side;
    } else {
      name_side = await this.languageService.translate.get('menu.sideMenu.noneQualification').toPromise();
      return name_side;
    }
  }

  private validate_rol_add_chipSearch() {
    if (!this.loginService.validateRole("expert")) {
      if (Object.keys(this.querySearchService.queryParams).length != 0) {
        let claves = Object.keys(this.querySearchService.queryParams);
        this.chipsSearch = [];
        for (let i = 0; i < claves.length; i++) {
          let clave = claves[i];
          this.chipsSearch.push({ value: this.querySearchService.queryParams[clave] });
        }
      }
      this.searchData();
    } else {
      if (!this.querySearchService.queryParams.is_evaluated) {
        this.querySearchService.queryParams.is_evaluated = "False";
      }
      this.searchExpert();
    }
  }

  async searchData() {
    this.loading = true;
    let searchSub = await this.searchService
      .search(this.querySearchService.queryParams)
      .subscribe(
        (res: any) => {
          this.objects = res.results;
          this.loading = false;
        },
        (err) => {
          console.log(err);
        }
      );
    this.subscribes.push(searchSub);
  }

  public removeChip(index) {
    for (var name in this.querySearchService.queryParams) {
      if (this.querySearchService.queryParams.hasOwnProperty(name)) {
        if (this.querySearchService.queryParams[name] === index.value) {
          delete this.querySearchService.queryParams[name]
          let extras: NavigationExtras = {
            queryParams: this.querySearchService.queryParams,
          };
          this.router.navigate(["/search"], extras);
        }
      }
    }
  }

  async searchExpert() {
    this.loading = true;
    let searchExpertSub = await this.searchService
      .searchExpert(this.querySearchService.queryParams)
      .subscribe(
        (res: any) => {
          this.objects = res.results;
          this.loading = false;
        },
        (err) => console.log(err)
      );
    this.subscribes.push(searchExpertSub);
  }

  onSearch() {
    if (
      this.querySearchService.queryParams.general_title &&
      this.querySearchService.queryParams.general_title !== ""
    ) {
      let extras: NavigationExtras = {
        queryParams: this.querySearchService.queryParams,
      };
      this.router.navigate(["/search"], extras);
    }
  }

  // async loadData() {
  //   let preferenceSubcription = await this.searchService
  //     .getPreferences()
  //     .subscribe((res) => {
  //       //console.log("preferences", res);
  //       this.preferences = res.result;
  //     });

  //   this.subscribes.push(preferenceSubcription);
  // }

  onClearFilters() {
    this.chipsSearch = [];
    this.querySearchService.queryParams = {
      is_evaluated: this.querySearchService.queryParams.is_evaluated
    };
    let extras: NavigationExtras = {
      queryParams: this.querySearchService.queryParams,
    };
    this.router.navigate(["/search"], extras);
  }

  get idQueryEmpty() {
    return Object.keys(this.querySearchService.queryParams).length !== 0
      ? true
      : false;
  }
  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  get roleTeacher() {
    return this.loginService.validateRole("teacher");
  }

  get roleStudent() {
    return this.loginService.validateRole("student");
  }

}
