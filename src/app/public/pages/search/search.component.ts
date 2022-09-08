import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { SearchService } from "../../../services/search.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";
import { QuerySearchService } from "../../../services/query-search.service";
import { LoginService } from '../../../services/login.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    public querySearchService: QuerySearchService,
    private loginService:LoginService
  ) {
    //this.loadData();
    this.route.queryParams.subscribe((params) => {
      this.querySearchService.queryParams = JSON.parse(JSON.stringify(params));
      if (!this.loginService.validateRole("expert")) {
        if(Object.keys(this.querySearchService.queryParams).length != 0) {
          let claves = Object.keys(this.querySearchService.queryParams);
          this.chipsSearch=[];
          for(let i = 0 ; i < claves.length; i++) {
            let clave = claves[i];
            this.chipsSearch.push({value:this.querySearchService.queryParams[clave]});
          }
        }
        this.searchData();
      } else {
        if(!this.querySearchService.queryParams.is_evaluated){
          this.querySearchService.queryParams.is_evaluated = "False";
        }
        this.searchExpert();
      }
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

  public removeChip(index){
    for (var name in this.querySearchService.queryParams) {
      if (this.querySearchService.queryParams.hasOwnProperty(name)) {
        if(this.querySearchService.queryParams[name] === index.value) {
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
          //console.log("params", this.querySearchService.queryParams)
          //console.log("results",res)
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
    this.chipsSearch=[];
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
