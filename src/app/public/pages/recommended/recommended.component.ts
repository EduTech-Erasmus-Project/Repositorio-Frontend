import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { firstValueFrom, forkJoin, of, Subject, takeUntil } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { LearningObjectService } from "../../../services/learning-object.service";
import { LoginService } from "src/app/services/login.service";

interface RatedLearningObjectResponse {
  learning_object: ObjectLearning;
  rating?: number;
}

type RecommendedResult = ObjectLearning | RatedLearningObjectResponse;

/**
 * Presenta los objetos recomendados para el usuario autenticado y los populares globales.
 *
 * Responsabilidades:
 * - Consultar recomendaciones segun rol elegible.
 * - Mostrar fallback cuando la carga falla o no existen datos.
 * - Publicar el breadcrumb de la pagina.
 */
@Component({
    selector: "app-recommended",
    templateUrl: "./recommended.component.html",
    styleUrls: ["./recommended.component.scss"],
    standalone: false
})
export class RecommendedComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly minimumSkeletonMs = 450;
  private loadingStartedAt = 0;
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  public readonly skeletonCards = Array.from({ length: 6 }, (_, index) => index);
  public recommended: ObjectLearning[] = [];
  public populars: ObjectLearning[] = [];
  public loading: boolean = false;
  public recommendedLoadFailed = false;
  public popularsLoadFailed = false;

  constructor(
    private objectService: LearningObjectService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    void this.addBreadcrumb();
    this.loadData();
  }

  /**
   * Publica el breadcrumb traducido de recomendados.
   */
  private async addBreadcrumb(): Promise<void> {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: await firstValueFrom(this.languageService.translate.get("menu.recommended")),
        routerLink: ["/recommended"],
      },
    ]);
  }

  /**
   * Carga en paralelo recomendaciones y populares, manejando fallbacks por separado.
   */
  loadData(): void {
    this.loading = true;
    this.loadingStartedAt = Date.now();
    this.recommendedLoadFailed = false;
    this.popularsLoadFailed = false;
    this.cdr.detectChanges();

    const recommended$ = this.userRole
      ? this.objectService.getRecommendedObjects().pipe(
          map((res) => this.mapRatedObjects(res || [])),
          catchError(() => {
            this.recommendedLoadFailed = true;
            return of([] as ObjectLearning[]);
          })
        )
      : of([] as ObjectLearning[]);

    const populars$ = this.objectService.getPopulars().pipe(
      map((res) => this.mapRatedObjects(res || [])),
      catchError(() => {
        this.popularsLoadFailed = true;
        return of([] as ObjectLearning[]);
      })
    );

    forkJoin({
      recommended: recommended$,
      populars: populars$,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ recommended, populars }) => {
        this.recommended = recommended;
        this.populars = populars;
        this.completeLoading();
      });
  }

  get userRole() {
    return (
      this.loginService.validateRole("student") ||
      this.loginService.validateRole("expert") ||
      this.loginService.validateRole("teacher")
    );
  }

  get recommendedCount() {
    return this.recommended.length;
  }

  get popularsCount() {
    return this.populars.length;
  }

  get showPopularsFallbackHint(): boolean {
    return this.userRole && !this.recommendedLoadFailed && this.recommendedCount === 0 && this.popularsCount > 0;
  }

  /**
   * Lleva al usuario al contenido fallback cuando todavia no existe historial
   * suficiente para recomendaciones personalizadas.
   */
  scrollToPopulars(): void {
    document
      .getElementById("recommended-populars")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * Mantiene estable el render de tarjetas usando el id del objeto si existe.
   */
  trackByObject(index: number, object: ObjectLearning): number {
    return object?.id ?? index;
  }

  /**
   * Aplana respuestas donde el backend envuelve el objeto junto a su rating calculado.
   */
  private mapRatedObjects(results: RecommendedResult[] = []): ObjectLearning[] {
    return results.map((result) => ({
      ...("learning_object" in result ? result.learning_object : result),
      rating: "rating" in result ? result.rating : undefined,
    }));
  }

  /**
   * Mantiene el skeleton el tiempo minimo suficiente para evitar saltos visuales
   * cuando los cards terminan de montar su contenido interno.
   */
  private completeLoading(): void {
    const elapsed = Date.now() - this.loadingStartedAt;
    const delay = Math.max(0, this.minimumSkeletonMs - elapsed);

    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }

    this.loadingTimer = setTimeout(() => {
      this.loading = false;
      this.loadingTimer = null;
      this.cdr.detectChanges();
    }, delay);
  }
}
