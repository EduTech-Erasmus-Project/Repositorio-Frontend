import { ChangeDetectorRef, Component, OnInit, OnDestroy } from "@angular/core";
import { Subject, forkJoin, takeUntil } from "rxjs";
import { SearchService } from "../../../services/search.service";
import { Router, NavigationExtras } from "@angular/router";
import { LoginService } from "../../../services/login.service";
import { EducationLevel } from "src/app/core/interfaces/EducationLevel";
import { KnowledgeArea } from "src/app/core/interfaces/KnowledgeArea";
import { License } from "../../../core/interfaces/License";
import {
  SearchFilterAreaGroupResponse,
  SearchFilterPreferenceResponse,
} from "src/app/core/interfaces/api-contracts";
import { QuerySearchService } from "../../../services/query-search.service";
import { extractYear } from "src/app/core/utils/date.utils";

type RelevanceFilter = "liked" | "scored" | "recent";
type YearFilterOption = { created: string };

@Component({
    selector: "app-sidebar-search",
    templateUrl: "./sidebar-search.component.html",
    styleUrls: ["./sidebar-search.component.scss"],
    standalone: false
})
export class SidebarSearchComponent implements OnInit, OnDestroy {
  private readonly relevanceFilters: RelevanceFilter[] = ["liked", "scored", "recent"];
  private readonly destroy$ = new Subject<void>();
  private readonly panelKeys = {
    expert: "expert",
    relevance: "relevance",
    areas: "areas",
    levels: "levels",
    preferences: "preferences",
    license: "license",
    year: "year",
  } as const;

  public areas: KnowledgeArea[] = [];
  public levels: EducationLevel[] = [];
  public preferences: SearchFilterAreaGroupResponse[] = [];
  public years: YearFilterOption[] = [];
  public licenses: License[] = [];
  public activePanels: string[] = [];

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
    public querySearchService: QuerySearchService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.syncActivePanels();
    this.loadData();
  }

  loadData() {
    forkJoin({
      areas: this.searchService.getInterestAreas(),
      levels: this.searchService.getLevelEducation(),
      years: this.searchService.getCreatedYear(),
      licenses: this.searchService.getLicenses(),
      preferences: this.searchService.getgetFilterArea(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ areas, levels, years, licenses, preferences }) => {
        this.areas = areas.values;
        this.levels = levels.values;
        this.years = years
          .map((date) => extractYear(date.created))
          .filter((year): year is number => year !== null)
          .map((year) => ({ created: String(year) }));
        this.licenses = licenses.values;
        this.preferences = preferences;
        this.cdr.detectChanges();
      });
  }

  getPreferencesGroup(group: string): SearchFilterPreferenceResponse[] {
    return this.preferences.find(
      (preference) => preference.filters_area === group
    )?.preferences_filter || [];
  }

  async submitSearch() {
    this.syncActivePanels();
    const extras: NavigationExtras = {
      queryParams: this.querySearchService.queryParams,
    };
    await this.router.navigate(["/search"], extras);
    //button = false;

  }

  /**
   * FUncion para buscaquedas 
   */
  async submitSearchExpert() {
    if (Object.keys(this.querySearchService.queryParams).length != 0) {
      const claves = Object.keys(this.querySearchService.queryParams);
      for (let i = 0; i < claves.length; i++) {
        const clave = claves[i];
        if (Array.isArray(this.querySearchService.queryParams[clave])) {
          switch (clave) {
            case 'liked':
              this.querySearchService.queryParams[clave] = this.querySearchService.queryParams[clave][0]
              break;
            case 'scored':
              this.querySearchService.queryParams[clave] = this.querySearchService.queryParams[clave][0]
              break;
            case 'recent':
              this.querySearchService.queryParams[clave] = this.querySearchService.queryParams[clave][0]
              break;
          }
        
        }else{
          switch (clave) {
            case 'liked':
              this.querySearchService.queryParams[clave] == 'True';
              this.removeFilter('liked')
            break;
            case 'scored':
              this.querySearchService.queryParams[clave] == 'True';
              this.removeFilter('scored')
            break;
            case 'recent':
              this.querySearchService.queryParams[clave] == 'True';
              this.removeFilter('recent')
            break;
          }
        }
      }
    }
    this.syncActivePanels();
    const extras: NavigationExtras = {
      queryParams: this.querySearchService.queryParams,
    };
    await this.router.navigate(["/search"], extras);
    //button = false;
  }

  public isRelevanceFilterActive(name_filter: RelevanceFilter): boolean {
    return this.querySearchService.queryParams[name_filter] === "True";
  }

  public async toggleRelevanceFilter(
    name_filter: RelevanceFilter,
    checked: boolean
  ) {
    if (checked) {
      this.relevanceFilters.forEach((filter) => {
        delete this.querySearchService.queryParams[filter];
      });
      this.querySearchService.queryParams[name_filter] = "True";
    } else {
      delete this.querySearchService.queryParams[name_filter];
    }

    this.syncActivePanels();
    await this.submitSearch();
  }

  public removeFilter(name_filter){
    if(this.querySearchService.queryParams[name_filter] !=''){
      delete this.querySearchService.queryParams[name_filter];
      this.syncActivePanels();
      const extras: NavigationExtras = {
        queryParams: this.querySearchService.queryParams,
      };
      this.router.navigate(["/search"], extras);
    }
  }

  get selectedPreferences() {
    return (
      this.querySearchService.queryParams.accesibility_features?.length > 0 ||
      this.querySearchService.queryParams.annotation_modeaccess?.length > 0 ||
      this.querySearchService.queryParams.accesibility_hazard?.length > 0 ||
      this.querySearchService.queryParams.key_preferences?.length > 0
    );
  }

  get hasRelevanceFilter() {
    return this.relevanceFilters.some((filter) => this.isRelevanceFilterActive(filter));
  }

  private syncActivePanels() {
    const nextPanels: string[] = [];

    if (this.querySearchService.queryParams.is_evaluated) {
      nextPanels.push(this.panelKeys.expert);
    }

    if (this.hasRelevanceFilter) {
      nextPanels.push(this.panelKeys.relevance);
    }

    if (this.querySearchService.queryParams.knowledge_area__name_es) {
      nextPanels.push(this.panelKeys.areas);
    }

    if (this.querySearchService.queryParams.education_levels__name_es) {
      nextPanels.push(this.panelKeys.levels);
    }

    if (this.selectedPreferences) {
      nextPanels.push(this.panelKeys.preferences);
    }

    if (this.querySearchService.queryParams.license__name_es) {
      nextPanels.push(this.panelKeys.license);
    }

    if (this.querySearchService.queryParams.created__year) {
      nextPanels.push(this.panelKeys.year);
    }

    this.activePanels = nextPanels;
  }
}
