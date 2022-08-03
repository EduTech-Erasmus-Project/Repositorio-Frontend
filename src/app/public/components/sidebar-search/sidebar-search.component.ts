import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { SearchService } from "../../../services/search.service";
import { Router, NavigationExtras } from "@angular/router";
import { LoginService } from "../../../services/login.service";
import { License } from "../../../core/interfaces/License";
import { QuerySearchService } from "../../../services/query-search.service";

@Component({
  selector: "app-sidebar-search",
  templateUrl: "./sidebar-search.component.html",
  styleUrls: ["./sidebar-search.component.scss"],
})
export class SidebarSearchComponent implements OnInit, OnDestroy {
  private suscribes: Subscription[] = [];

  public areas: any[] = [];
  public levels: any[] = [];
  public preferences: any[] = [];
  public years: any[] = [];
  public licenses: License[] = [];

  public calificate: boolean = false;
  public areasBtn: boolean = false;
  public levelsBtn: boolean = false;
  public preferencesBtn: boolean = false;
  public yearsBtn: boolean = false;
  public lisenceBtn: boolean = false;

  constructor(
    private searchService: SearchService,
    private router: Router,
    public loginService: LoginService,
    public querySearchService: QuerySearchService
  ) {}

  ngOnDestroy(): void {
    this.suscribes.forEach((item) => {
      item.unsubscribe;
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    let areaSubcription = await this.searchService
      .getInterestAreas()
      .subscribe((res) => {
        this.areas = res.values;
      });

    let levelSubcription = await this.searchService
      .getLevelEducation()
      .subscribe((res) => {
        this.levels = res.values;
      });

    // let preferenceSubcription = await this.searchService
    //   .getPreferences()
    //   .subscribe((res) => {
    //     res.results.forEach((element) => {
    //       let preferenceFind = this.preferences.find(
    //         (preference) => preference.description === element.description
    //       );
    //       if (!preferenceFind) {
    //         this.preferences.push(element);
    //       }
    //     });
    //   });

    let yearSubcription = await this.searchService
      .getCreatedYear()
      .subscribe((res: any) => {
        this.years = res.map((date) => {
          let year = new Date(date.created);
          return { created: year.getFullYear() };
        });
      });

    let licenseSub = await this.searchService
      .getLicenses()
      .subscribe((res: any) => {
        //console.log("licenses res", res.results)
        this.licenses = res.values;
      });

    let filterAreaaSub = await this.searchService
      .getgetFilterArea()
      .subscribe((res: any) => {
        //console.log("filters res", res);
        this.preferences = res;
      });

    this.suscribes.push(
      areaSubcription,
      levelSubcription,
      yearSubcription,
      licenseSub,
      filterAreaaSub
    );
  }

  getPreferencesGroup(group: string) {

    let preferencesFilter;
    try {
      preferencesFilter= this.preferences.find(
        (preference) => preference.filters_area === group
      ).preferences_filter;
    } catch (error) {
      
    }
    return preferencesFilter;
  }

  async submitSearch() {
    let extras: NavigationExtras = {
      queryParams: this.querySearchService.queryParams,
    };
    await this.router.navigate(["/search"], extras);
    //button = false;
  }

  async submitSearchExpert() {
 
    let extras: NavigationExtras = {
      queryParams: this.querySearchService.queryParams,
    };
    await this.router.navigate(["/search"], extras);
    //button = false;
  }

  get selectedPreferences() {
    return (
      this.querySearchService.queryParams.accesibility_features?.length > 0 ||
      this.querySearchService.queryParams.annotation_modeaccess?.length > 0 ||
      this.querySearchService.queryParams.accesibility_hazard?.length > 0 ||
      this.querySearchService.queryParams.key_preferences?.length > 0
    );
  }
}
