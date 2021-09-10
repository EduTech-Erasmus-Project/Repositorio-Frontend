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
        //console.log("params", this.querySearchService.queryParams)
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
          //console.log("params", this.querySearchService.queryParams)
          //console.log("results",res)
          this.objects = res.results;
          this.loading = false;
        },
        (err) => {
          console.log(err);
        }
      );
    this.subscribes.push(searchSub);
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
}
