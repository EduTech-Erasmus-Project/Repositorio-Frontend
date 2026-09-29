import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { SearchService } from "../../../services/search.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { firstValueFrom } from "rxjs";
import { QuerySearchService } from "../../../services/query-search.service";
import { LoginService } from "../../../services/login.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface SearchChip {
  value: string;
}

type SearchQueryParams = Record<string, string>;

/**
 * Coordina la pagina principal de busqueda publica del repositorio.
 *
 * Responsabilidades:
 * - Sincronizar query params, chips visuales y resultados remotos.
 * - Construir el breadcrumb segun el rol y el modo de evaluacion.
 * - Gestionar paginacion y limpieza de filtros desde la vista.
 *
 * Notas:
 * - Conserva `detectChanges()` porque varios cambios de estado ocurren
 *   despues de traducciones async o respuestas HTTP bajo Angular 21.
 */
@Component({
    selector: "app-search",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.scss"],
    standalone: false
})
export class SearchComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  public chipsSearch: SearchChip[] = [];
  public objects: ObjectLearning[] = [];
  public objectsSkeleton: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  ];
  public loading: boolean = false;
  public isEvaluatedParams: SearchQueryParams = {};

  public rows: number = 0;
  public first: number = 0;
  public totalRecords: number = 0;
  public pageSize: number = 0;
  public page_now: number = 0;
  private nextEvent: string = "";
  private previousEvent: string = "";
  public resultOAsNone: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    public querySearchService: QuerySearchService,
    private loginService: LoginService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.chipsSearch = [];
        this.querySearchService.queryParams = { ...params };
        this.isEvaluatedParams = { ...params };
        void this.handleQueryParamsChange();
      });
  }

  /**
   * Recalcula breadcrumb, chips y resultados cada vez que cambian los query params.
   */
  private async handleQueryParamsChange(): Promise<void> {
    await this.addBreadcrumb();
    await this.syncChipsAndSearch();
    this.cdr.detectChanges();
  }

  /**
   * Publica el breadcrumb de busqueda, agregando el subnivel de experto cuando aplica.
   */
  private async addBreadcrumb(): Promise<void> {
    if (!this.loginService.validateRole("expert")) {
      this.breadcrumbService.setItems([
        { label: "ROA" },
        {
          label: await this.getTranslation("menu.search"),
          routerLink: ["/search"],
        },
      ]);
    } else {
      const nameLabel = this.getExpertEvaluationLabel();
      this.breadcrumbService.setItems([
        { label: "ROA" },
        {
          label: await this.getTranslation("menu.search"),
        },
        { label: await nameLabel, routerLink: ["/search"] },
      ]);
    }
  }

  /**
   * Resuelve el label secundario del breadcrumb para el flujo de evaluacion experto.
   */
  private async getExpertEvaluationLabel(): Promise<string> {
    return this.isEvaluatedParams.is_evaluated === "True"
      ? this.getTranslation("menu.sideMenu.qualified")
      : this.getTranslation("menu.sideMenu.noneQualification");
  }

  /**
   * Traduce filtros activos a chips visibles y luego dispara la consulta remota.
   */
  private async syncChipsAndSearch(): Promise<void> {
    if (Object.keys(this.querySearchService.queryParams).length !== 0) {
      const keys = Object.keys(this.querySearchService.queryParams);
      this.chipsSearch = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (this.querySearchService.queryParams[key].length !== 0) {
          const wasProcessed = await this.appendTranslatedFilterChip(
            this.querySearchService.queryParams[key],
            key
          );

          if (!wasProcessed) {
            this.chipsSearch.push({
              value: this.querySearchService.queryParams[key],
            });
          }
        }
      }
    }

    this.searchData();
  }

  /**
   * Traduce filtros booleanos especiales a chips legibles para el usuario.
   */
  private async appendTranslatedFilterChip(queryParam: string, key: string): Promise<boolean> {
    if (
      queryParam === "True" ||
      queryParam === "False"
    ) {
      switch (key) {
        case "is_evaluated":
          queryParam === "True"
          ? this.chipsSearch.push({
            value: await this.getTranslation("menu.sideMenu.qualified"),
          })
          : this.chipsSearch.push({
            value: await this.getTranslation("menu.sideMenu.noneQualification"),
          });
          break;
        case "scored":
          queryParam === "True"
          ? this.chipsSearch.push({
            value: await this.getTranslation("object.labelPopulars"),
          })
          :this.router.navigate(['/search']);
          break;
        case "liked":
          queryParam === "True"
          ? this.chipsSearch.push({
            value: await this.getTranslation("object.labelLikes"),
          })
          :this.router.navigate(['/search']);
          break;
        case "recent":
          queryParam === "True"
          ? this.chipsSearch.push({
            value: await this.getTranslation("object.labelMostRecent"),
          })
          :this.router.navigate(['/search']);
          break;
      }
      return true;
    } else {
      return false;
    }
  }

  /**
   * Ejecuta la consulta principal de objetos de aprendizaje con los filtros activos.
   */
  searchData(): void {
    this.loading = true;
    this.first = 0;
    this.resultOAsNone = false;
    this.cdr.detectChanges();

    this.searchService
      .search(this.querySearchService.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.results.length > 0) {
            this.pageSize = res.pages;
            this.totalRecords = res.count;
            this.rows = res.results.length;
            this.objects = res.results;
            this.nextEvent = res.links.next;
            this.previousEvent = res.links.previous;
            this.resultOAsNone = false;
          } else {
            this.objects = [];
            this.resultOAsNone = true;
            this.pageSize = 0;
            this.totalRecords = 0;
            this.rows = 0;
            this.nextEvent = "";
            this.previousEvent = "";
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.objects = [];
          this.resultOAsNone = false;
          this.pageSize = 0;
          this.totalRecords = 0;
          this.rows = 0;
          this.nextEvent = "";
          this.previousEvent = "";
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * Elimina un chip visual y sincroniza los query params resultantes con la URL.
   */
  public async removeChip(chip: SearchChip): Promise<void> {
    if (
      chip.value ===
      (await this.getTranslation("menu.sideMenu.noneQualification"))
    ) {
      chip.value = "False";
    } else if (
      chip.value ===
      (await this.getTranslation("menu.sideMenu.qualified"))
    ) {
      chip.value = "True";
    }

    chip.value = await this.normalizeTranslatedRelevanceChip(chip.value);

    for (const name in this.querySearchService.queryParams) {
      if (this.querySearchService.queryParams.hasOwnProperty(name)) {
        const removedRelevanceFilter = this.removeRelevanceFilterParam(name, chip.value);
        if (!removedRelevanceFilter) {
          if (this.querySearchService.queryParams[name] === chip.value) {
            delete this.querySearchService.queryParams[name];
            const extras: NavigationExtras = {
              queryParams: this.querySearchService.queryParams,
            };
            this.router.navigate(["/search"], extras);
          }
        }
      
      }
    }
  }

  /**
   * Convierte un chip traducido de relevancia a su nombre tecnico dentro del query param.
   */
  private async normalizeTranslatedRelevanceChip(chipValue: string): Promise<string> {
    switch (chipValue) {
      case await this.getTranslation("object.labelLikes"):
        return 'liked';
      case await this.getTranslation("object.labelPopulars"):
        return 'scored';
      case await this.getTranslation("object.labelMostRecent"):
        return 'recent';
      default:
        return chipValue;
    }
  }

  /**
   * Elimina filtros de relevancia cuyo nombre tecnico coincide con el chip removido.
   */
  private removeRelevanceFilterParam(name: string, chipValue: string): boolean {
    if (name === chipValue) {
      delete this.querySearchService.queryParams[name];
      const extras: NavigationExtras = {
        queryParams: this.querySearchService.queryParams,
      };
      this.router.navigate(["/search"], extras);
      return true;
    }
    return false;
  }

  /**
   * Navega a la misma ruta de busqueda usando el texto general como query param.
   */
  onSearch(): void {
    if (
      this.querySearchService.queryParams.general_title &&
      this.querySearchService.queryParams.general_title !== ""
    ) {
      const extras: NavigationExtras = {
        queryParams: this.querySearchService.queryParams,
      };
      this.router.navigate(["/search"], extras);
    }
  }


  /**
   * Limpia filtros visuales y query params para reiniciar la busqueda.
   */
  onClearFilters(): void {
    this.chipsSearch = [];

    this.querySearchService.queryParams = {};
    const extras: NavigationExtras = {
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

  get hasResults(): boolean {
    return this.objects?.length > 0;
  }

  get showEmptyResults(): boolean {
    return !this.loading && this.resultOAsNone && !this.hasResults;
  }

  get showPaginator(): boolean {
    return this.hasResults && this.totalRecords > this.rows;
  }

  /**
   * Solicita una pagina remota adicional manteniendo los filtros activos.
   */
  paginate(event: { page: number; first: number }): void {
    this.loading = true;
    const page_number: number = event.page + 1;
    this.first = event.first;
    this.cdr.detectChanges();

    this.searchService
      .searchPagePaginator(page_number, this.querySearchService.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (search_page) => {
          if (search_page?.results.length > 0) {
            this.objects = search_page.results;
            this.nextEvent = search_page.links.next;
            this.previousEvent = search_page.links.previous;
          } else {
            this.objects = [];
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private async getTranslation(key: string): Promise<string> {
    return firstValueFrom(this.languageService.translate.get(key));
  }
}
