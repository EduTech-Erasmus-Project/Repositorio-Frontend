import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { SearchService } from "../../../services/search.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";
import { QuerySearchService } from "../../../services/query-search.service";
import { LoginService } from "../../../services/login.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { Paginator } from "primeng/paginator";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, OnDestroy {
  public title: string;
  private subscribes: Subscription[] = [];
  public preferences: any[] = [];
  public chipsSearch: any[];
  public objects: ObjectLearning[];
  public objectsSkeleton: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  ];
  public loading: boolean = false;
  public is_evaluated: any;

  public rows: number = 0;
  public totalRecords: number = 0;
  public pageSize: number = 0;
  public page_now: number = 0;
  private next_event: string = "";
  private previus_event: string = "";
  public resultOAsNone: boolean = false;
  @ViewChild("paginator", { static: true }) paginator: Paginator;
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
      this.chipsSearch = [];
      this.querySearchService.queryParams = JSON.parse(JSON.stringify(params));
      this.is_evaluated = params;
      this.add_breadcrumb();
      this.validate_rol_add_chipSearch();
    });
  }

  ngOnInit(): void {
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
        {
          label: await this.languageService.translate
            .get("menu.search")
            .toPromise(),
          routerLink: ["/search"],
        },
      ]);
    } else {
      let name_label = this.validate_is_evaluate();
      this.breadcrumbService.setItems([
        { label: "ROA" },
        {
          label: await this.languageService.translate
            .get("menu.search")
            .toPromise(),
        },
        { label: await name_label, routerLink: ["/search"] },
      ]);
    }
  }

  private async validate_is_evaluate() {
    let name_side: string;
    if (this.is_evaluated.is_evaluated == "True") {
      name_side = await this.languageService.translate
        .get("menu.sideMenu.qualified")
        .toPromise();
      return name_side;
    } else {
      name_side = await this.languageService.translate
        .get("menu.sideMenu.noneQualification")
        .toPromise();
      return name_side;
    }
  }

  private async validate_rol_add_chipSearch() {
    // if (!this.loginService.validateRole("expert")) {
    //   if (Object.keys(this.querySearchService.queryParams).length != 0) {
    //     let claves = Object.keys(this.querySearchService.queryParams);
    //     this.chipsSearch = [];
    //     for (let i = 0; i < claves.length; i++) {
    //       let clave = claves[i];
    //       if (this.querySearchService.queryParams[clave].length !== 0) {
    //         this.chipsSearch.push({
    //           value: this.querySearchService.queryParams[clave],
    //         });
    //       }
    //     }
    //   }
    //   this.searchData();
    // } else {
    if (Object.keys(this.querySearchService.queryParams).length != 0) {
      let claves = Object.keys(this.querySearchService.queryParams);
      this.chipsSearch = [];
      for (let i = 0; i < claves.length; i++) {
        let clave = claves[i];
        if (this.querySearchService.queryParams[clave].length !== 0) {
          let flag_process = await this.checkParameterNames(this.chipsSearch, this.querySearchService.queryParams[clave], clave)
          if(!flag_process){
            this.chipsSearch.push({
              value: this.querySearchService.queryParams[clave],
            });
          }
        }
      }
    }

    // if (!this.querySearchService.queryParams.is_evaluated) {
    //   this.querySearchService.queryParams.is_evaluated = "False";
    // }
    this.searchData();
    //Eliminamos para enviar los mismo filtro para todos los profesores
    //this.searchExpert();
    //}
  }

  /**
   * Funcion para revisar los diferentes parametros que se envian el la url
   * @param array_chipSearch 
   */
  private async checkParameterNames(array_chipSearch, queryParams, clave):Promise<boolean> {
    if (
      this.querySearchService.queryParams[clave] === "True" ||
      this.querySearchService.queryParams[clave] === "False"
      
    ) {
      switch (clave) {
        case "is_evaluated":
          this.querySearchService.queryParams[clave] === "True"
          ? this.chipsSearch.push({
            value: await this.languageService.translate
              .get("menu.sideMenu.qualified")
              .toPromise(),
          })
          : this.chipsSearch.push({
            value: await this.languageService.translate
              .get("menu.sideMenu.noneQualification")
              .toPromise(),
          });
          break;
        case "scored":
          this.querySearchService.queryParams[clave] === "True"
          ? this.chipsSearch.push({
            value: await this.languageService.translate
              .get("object.labelPopulars")
              .toPromise(),
          })
          :this.router.navigate(['/search']);
          break;
        case "liked":
          this.querySearchService.queryParams[clave] === "True"
          ? this.chipsSearch.push({
            value: await this.languageService.translate
              .get("object.labelLikes")
              .toPromise(),
          })
          :this.router.navigate(['/search']);
          break;
        case "recent":
          this.querySearchService.queryParams[clave] === "True"
          ? this.chipsSearch.push({
            value: await this.languageService.translate
              .get("object.labelMostRecent")
              .toPromise(),
          })
          :this.router.navigate(['/search']);
          break;
      }
      return true;
    } else {
      return false;
    }
  }

  async searchData() {
    this.loading = true;
    let searchSub = await this.searchService
      .search(this.querySearchService.queryParams)
      .subscribe(
        (res: any) => {
          if (res.results.length > 0) {
            this.pageSize = res.pages;
            this.totalRecords = res.count;
            this.rows = res.results.length;
            this.objects = res.results;
            this.next_event = res.links.next;
            this.previus_event = res.links.previous;

            this.loading = false;
            this.resultOAsNone = false;
          } else {
            this.loading = false;
            this.resultOAsNone = true;
          }
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
    this.subscribes.push(searchSub);
  }

  public async removeChip(index) {
    if (
      index.value ===
      (await this.languageService.translate
        .get("menu.sideMenu.noneQualification")
        .toPromise())
    ) {
      index.value = "False";
    } else if (
      index.value ===
      (await this.languageService.translate
        .get("menu.sideMenu.qualified")
        .toPromise())
    ) {
      index.value = "True";
    }

    index.value = await this.renameIndexVarWithFilterRelevance(index.value);

    for (var name in this.querySearchService.queryParams) {
      if (this.querySearchService.queryParams.hasOwnProperty(name)) {
        let removeIndv = this.removeParamsRelevanceFilter(this.querySearchService.queryParams[name], name, index.value);
        if(!removeIndv) {
          if (this.querySearchService.queryParams[name] === index.value) {
            delete this.querySearchService.queryParams[name];
            let extras: NavigationExtras = {
              queryParams: this.querySearchService.queryParams,
            };
            this.router.navigate(["/search"], extras);
          }
        }
        
      }
    }
  }
  /**
   * Funcion para renombrar los campos de entrada
   * @param index 
   * @returns 
   */
private async renameIndexVarWithFilterRelevance(index){
  switch (index){
    case  await this.languageService.translate
        .get("object.labelLikes")
        .toPromise():
        return 'liked';
      break;
    case  await this.languageService.translate
    .get("object.labelPopulars")
    .toPromise():
      return 'scored';
        break;
    case await this.languageService.translate
    .get("object.labelMostRecent")
    .toPromise():
      return 'recent' 
    break;
  }
  return index;
}

  private removeParamsRelevanceFilter( queryParams,name, indexValue){
    if(name == indexValue){
      delete this.querySearchService.queryParams[name];
      let extras: NavigationExtras = {
        queryParams: this.querySearchService.queryParams,
      };
      this.router.navigate(["/search"], extras);
      return true
    }
    return false
  }

  // async searchExpert() {
  //   this.loading = true;
  //   let searchExpertSub = await this.searchService
  //     .searchExpert(this.querySearchService.queryParams)
  //     .subscribe(
  //       (res: any) => {
  //         this.objects = res.results;
  //         this.loading = false;
  //       },
  //       (err) => console.log(err)
  //     );
  //   this.subscribes.push(searchExpertSub);
  // }

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
    // this.querySearchService.queryParams = {
    //   is_evaluated: this.querySearchService.queryParams.is_evaluated,
    // };
    this.querySearchService.queryParams = {}
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

  /**
   * funcion para implementar la paginacion
   * @param event
   */
  async paginate(event) {
    //event.first = Index of the first record
    //event.rows = Number of rows to display in new page
    //event.page = Index of the new page
    //event.pageCount = Total number of pages
    this.loading = true;
    const page_number: number = event.page + 1;
    //this.updateCurrentPage(this.page_now);
    try {
      let search_page: any = await this.searchService
        .searchPagePaginator(page_number)
        .toPromise();
      if (search_page) {
        if (search_page.results.length > 0) {
          this.objects = search_page.results;
          this.loading = false;
          this.next_event = search_page.links.next;
          this.previus_event = search_page.links.previous;
        }
      }
    } catch (err) {
      this.loading = false;
    }
  }

  private updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage));
  }
}
