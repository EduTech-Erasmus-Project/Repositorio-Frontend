import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ViewportScroller } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router, NavigationExtras, Params, Scroll } from "@angular/router";
import { SearchService } from "../../../services/search.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { filter, firstValueFrom } from "rxjs";
import { DEFAULT_SEARCH_PAGE_SIZE, QuerySearchService } from "../../../services/query-search.service";
import { LoginService } from "../../../services/login.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { QuerySearch } from "src/app/core/interfaces/Search";
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
 * Estado al volver atras:
 * - La pagina (`page`) y el tamano (`page_size`) viven en la URL junto a los
 *   filtros, asi el historial del navegador los conserva.
 * - El scroll lo guarda el router en cada navegacion; al volver se restaura
 *   cuando los resultados ya estan pintados (antes la pagina no tiene altura).
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
  /** Resultados por pagina: 15 por defecto y el usuario puede elegir otro. */
  public readonly rowsPerPageOptions: number[] = [10, 15, 20, 50];
  public rowsPerPage: number = this.querySearchService.pageSize;
  public objectsSkeleton: number[] = this.buildSkeleton(this.rowsPerPage);
  public loading: boolean = false;
  public isEvaluatedParams: SearchQueryParams = {};

  public rows: number = 0;
  public first: number = 0;
  public totalRecords: number = 0;
  public resultOAsNone: boolean = false;
  /** Pagina pedida en la URL (1 si no viene). */
  private requestedPage: number = 1;
  /** Scroll guardado por el router para esta entrada del historial. */
  private pendingScroll: [number, number] | null = null;
  /** Al cambiar de pagina desde el paginador se sube al inicio de los resultados. */
  private scrollToResults: boolean = false;
  private readonly viewportScroller = inject(ViewportScroller);
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
    // Con "atras/adelante" el router trae la posicion guardada de esa entrada.
    this.router.events
      .pipe(
        filter((event): event is Scroll => event instanceof Scroll),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        if (!event.position) {
          return;
        }
        this.pendingScroll = event.position;
        if (!this.loading && this.hasResults) {
          this.restoreScroll();
        }
      });

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        // `page` y `page_size` no son filtros: no generan chips y no viajan
        // cuando el usuario cambia de filtro (eso vuelve a la pagina 1).
        const { page, page_size, ...filters } = params;
        if (this.restorePageSizeInUrl(page_size)) {
          return;
        }
        this.chipsSearch = [];
        this.applyPagingParams(page, page_size);
        this.querySearchService.queryParams = { ...filters };
        this.isEvaluatedParams = { ...filters };
        void this.handleQueryParamsChange();
      });
  }

  /**
   * Los filtros (sidebar, input, chips) navegan sin `page_size`. Si el usuario
   * eligio otro tamano, se vuelve a escribir en la URL reemplazando la entrada,
   * para que recargar o compartir el enlace lo conserve. La nueva URL dispara
   * la consulta, asi que esta emision no busca.
   */
  private restorePageSizeInUrl(pageSize: string | undefined): boolean {
    const preferred = this.querySearchService.pageSize;
    if (pageSize !== undefined || preferred === DEFAULT_SEARCH_PAGE_SIZE) {
      return false;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page_size: preferred },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
    return true;
  }

  /** Lee `page` y `page_size` de la URL, ignorando valores invalidos. */
  private applyPagingParams(page: string | undefined, pageSize: string | undefined): void {
    const pageNumber = Number(page);
    this.requestedPage = Number.isInteger(pageNumber) && pageNumber > 1 ? pageNumber : 1;

    const size = Number(pageSize);
    if (this.rowsPerPageOptions.includes(size)) {
      this.querySearchService.pageSize = size;
    }
    this.rowsPerPage = this.querySearchService.pageSize;
    this.objectsSkeleton = this.buildSkeleton(this.rowsPerPage);
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
    const page = this.requestedPage;
    this.first = (page - 1) * this.rowsPerPage;
    this.resultOAsNone = false;
    this.cdr.detectChanges();

    const query = this.withPageSize(this.querySearchService.queryParams);
    this.searchService
      .search(page > 1 ? { ...query, page: String(page) } : query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.results.length > 0) {
            this.totalRecords = res.count;
            this.rows = this.rowsPerPage;
            this.objects = res.results;
            this.resultOAsNone = false;
          } else {
            this.objects = [];
            this.resultOAsNone = true;
            this.totalRecords = 0;
            this.rows = 0;
          }
          this.loading = false;
          this.cdr.detectChanges();
          this.afterResultsRendered();
        },
        error: (err: HttpErrorResponse) => {
          // Una pagina que ya no existe (p. ej. ahora hay menos OA) vuelve a la 1.
          if (err?.status === 404 && page > 1) {
            this.goToPage(1, this.rowsPerPage);
            return;
          }
          this.objects = [];
          this.resultOAsNone = false;
          this.totalRecords = 0;
          this.rows = 0;
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
    if (!this.hasResults) {
      return false;
    }
    // Se muestra mientras haya mas resultados que la opcion minima, asi quien
    // eligio 50 puede volver a una pagina mas corta.
    return this.totalRecords > Math.min(...this.rowsPerPageOptions);
  }

  /**
   * Cambia de pagina o de tamano escribiendolos en la URL; la suscripcion a los
   * query params hace la consulta.
   */
  paginate(event: { page: number; first: number; rows?: number }): void {
    const rows = event.rows || this.rowsPerPage;
    // Al cambiar el tamano se vuelve a la primera pagina.
    const page = rows !== this.rowsPerPage ? 1 : event.page + 1;
    this.scrollToResults = true;
    this.goToPage(page, rows);
  }

  /**
   * Reemplaza la entrada del historial en vez de apilar una por pagina: "atras"
   * desde un OA vuelve a la pagina donde estaba, y "atras" desde la busqueda
   * sale de ella sin recorrer cada pagina visitada.
   */
  private goToPage(page: number, rows: number): void {
    this.querySearchService.pageSize = rows;
    const queryParams: Params = {
      page: page > 1 ? page : null,
      page_size: rows !== DEFAULT_SEARCH_PAGE_SIZE ? rows : null,
    };
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  /** Restaura el scroll de "atras" o sube a los resultados tras paginar. */
  private afterResultsRendered(): void {
    if (this.pendingScroll) {
      this.restoreScroll();
    } else if (this.scrollToResults) {
      this.scrollToResults = false;
      requestAnimationFrame(() => this.viewportScroller.scrollToAnchor("search-results"));
    }
  }

  private restoreScroll(): void {
    const position = this.pendingScroll;
    this.pendingScroll = null;
    if (position) {
      requestAnimationFrame(() => this.viewportScroller.scrollToPosition(position));
    }
  }

  /** Agrega `page_size` a la consulta sin tocar los query params de la URL. */
  private withPageSize(params: QuerySearch): QuerySearch & { page_size: string } {
    return { ...params, page_size: String(this.rowsPerPage) };
  }

  private buildSkeleton(size: number): number[] {
    return Array.from({ length: size }, (_, index) => index + 1);
  }

  private async getTranslation(key: string): Promise<string> {
    return firstValueFrom(this.languageService.translate.get(key));
  }
}
