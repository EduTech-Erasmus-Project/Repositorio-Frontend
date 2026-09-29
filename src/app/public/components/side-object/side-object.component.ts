import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LearningObjectService } from "../../../services/learning-object.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { LoginService } from "../../../services/login.service";

interface RatedLearningObjectResponse {
  learning_object: ObjectLearning;
  rating?: number;
}

type SideObjectResult = ObjectLearning | RatedLearningObjectResponse;
type ExpertNoRatedResponse = ObjectLearning[] | { results?: ObjectLearning[] };

/**
 * Renderiza la columna lateral de descubrimiento dentro del detalle de OA.
 *
 * Responsabilidades:
 * - Cargar el carril contextual segun el rol actual.
 * - Reenviar busquedas rapidas al modulo de `search`.
 * - Mantener una lista compacta de objetos relacionados o pendientes de evaluar.
 */
@Component({
    selector: "app-side-object",
    templateUrl: "./side-object.component.html",
    styleUrls: ["./side-object.component.scss"],
    standalone: false
})
export class SideObjectComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  public title = "";
  public objects: ObjectLearning[] = [];

  constructor(
    private router: Router,
    private learningObjectService: LearningObjectService,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  onSearch(): void {
    const searchTitle = this.title.trim();

    if (searchTitle) {
      const extras: NavigationExtras = {
        queryParams: {
          general_title: searchTitle,
        },
      };
      this.router.navigate(["/search"], extras);
    }
  }

  loadData(): void {
    if (this.studentRole) {
      this.learningObjectService
        .getRecommendedObjects()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: ObjectLearning[] = []) => {
          this.objects = this.mapWrappedResults(res);
          this.cdr.detectChanges();
        });
      return;
    }

    if (this.expertRole) {
      this.learningObjectService
        .searchExpertNoRated()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: ExpertNoRatedResponse = []) => {
            this.objects = this.mapNoRatedResults(res);
            this.cdr.detectChanges();
          });
      return;
    }

    this.learningObjectService
        .getPopulars()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: ObjectLearning[] = []) => {
          this.objects = this.mapWrappedResults(res);
          this.cdr.detectChanges();
        });
  }

  onClick(slug: string): void {
    this.router.navigate(["/object", slug]);
  }

  trackByObject(_: number, object: ObjectLearning): number | string {
    return object.id ?? object.slug;
  }

  get sectionTitleKey(): string {
    if (this.studentRole) {
      return "object.labelRecommended";
    }

    if (this.expertRole) {
      return "object.labelNoRated";
    }

    return "object.labelPopulars";
  }

  get studentRole() {
    return this.loginService.validateRole("student");
  }

  get expertRole() {
    return this.loginService.validateRole("expert");
  }

  /**
   * Normaliza respuestas donde el backend envuelve el OA dentro de `learning_object`.
   */
  private mapWrappedResults(results: SideObjectResult[]): ObjectLearning[] {
    return results.map((item) => ({
      ...("learning_object" in item ? item.learning_object : item),
      rating: "rating" in item ? item.rating : undefined,
    }));
  }

  /**
   * Tolera tanto la respuesta paginada legacy `{ results }` como el arreglo plano actual.
   */
  private mapNoRatedResults(response: ExpertNoRatedResponse): ObjectLearning[] {
    const items = Array.isArray(response) ? response : response.results || [];

    return items.map((item) => ({
      ...item,
      rating: 0,
    }));
  }
}
