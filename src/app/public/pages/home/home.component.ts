import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, forkJoin, Subject, takeUntil } from "rxjs";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { LearningObjectService } from "../../../services/learning-object.service";
import { LoginService } from "../../../services/login.service";
import { LanguageService } from "../../../services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";

interface RatedLearningObject extends ObjectLearning {
  rating?: number;
}

type RatedLearningObjectResponse =
  | RatedLearningObject
  | {
      learning_object: ObjectLearning;
      rating?: number;
    };

/**
 * Orquesta la portada publica del repositorio y sus tres carriles de descubrimiento.
 *
 * Responsabilidades:
 * - Cargar objetos populares, mas gustados y mas recientes.
 * - Exponer accesos rapidos hacia busqueda o recomendados.
 * - Publicar el breadcrumb de la ruta inicial.
 *
 * Notas:
 * - La pagina depende de tres consultas simultaneas y mantiene `detectChanges()`
 *   para reflejar el estado de carga inmediatamente despues del `forkJoin`.
 */
@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
    standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  public populars: RatedLearningObject[] = [];
  public mostLiked: RatedLearningObject[] = [];
  public mostRecent: RatedLearningObject[] = [];
  public loading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private objectService: LearningObjectService,
    private loginService: LoginService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Navega hacia una ruta publica derivada desde la portada.
   */
  onNavegateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Redirige a la pagina de busqueda con filtros prearmados segun el carril seleccionado.
   */
  public sendParameters(type: string): void {
    switch (type) {
      case "liked":
        this.router.navigate(["/search"], { queryParams: { liked: "True" } });
        break;
      case "recent":
        this.router.navigate(["/search"], { queryParams: { recent: "True" } });
        break;
      case "scored":
        this.router.navigate(["/search"], { queryParams: { scored: "True" } });
        break;
    }
  }

  public get student() {
    return this.loginService.validateRole("student");
  }

  /**
   * Publica el breadcrumb de la portada una vez resuelto el label traducido.
   */
  private async addBreadcrumb(): Promise<void> {
    const homeLabel = await firstValueFrom(
      this.languageService.translate.get("menu.home")
    );

    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: homeLabel, routerLink: ["/"] },
    ]);
  }

  /**
   * Carga en paralelo los bloques de descubrimiento que se muestran en la portada.
   */
  private loadData(): void {
    this.loading = true;
    this.cdr.detectChanges();

    forkJoin({
      populars: this.objectService.getPopulars(),
      mostLiked: this.objectService.getMostPopulars(),
      mostRecent: this.objectService.getMostRecent(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ populars, mostLiked, mostRecent }) => {
          this.populars = this.mapPopularResults(populars);
          this.mostLiked = this.mapRatedObjects(mostLiked);
          this.mostRecent = this.mapRatedObjects(mostRecent);

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * Normaliza la respuesta de populares, cuyo rating viene envuelto junto al learning object.
   */
  private mapPopularResults(results: RatedLearningObjectResponse[] = []): RatedLearningObject[] {
    return results.map((item) => {
      if ("learning_object" in item) {
        return {
          ...item.learning_object,
          rating: item.rating,
        };
      }

      return {
        ...item,
        rating: item.rating,
      };
    });
  }

  /**
   * Normaliza respuestas donde el objeto ya llega en la raiz con rating opcional.
   */
  private mapRatedObjects(results: RatedLearningObject[] = []): RatedLearningObject[] {
    return results.map((item) => ({
      ...item,
      rating: item.rating,
    }));
  }
}
