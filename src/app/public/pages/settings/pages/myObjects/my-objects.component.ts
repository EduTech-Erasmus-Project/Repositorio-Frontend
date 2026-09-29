import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { PaginatorState } from "primeng/paginator";
import { ApiPaginatedResponse } from "src/app/core/interfaces/api-contracts";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { firstValueFrom } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
    selector: "app-my-objects",
    templateUrl: "./my-objects.component.html",
    styleUrls: ["./my-objects.component.scss"],
    standalone: false
})
/**
 * Lista los objetos de aprendizaje cargados por el docente autenticado.
 *
 * La pantalla depende de un endpoint paginado y reutiliza `app-card` para
 * mostrar acciones de mantenimiento sobre cada OA.
 */
export class MyObjectsComponent implements OnInit {
  public objects: ObjectLearning[] = [];
  public isLoading = true;
  public loadError = false;
  public rows: number = 0;
  public totalRecords: number = 0;
  public pageSize: number = 0;
  public currentPage: number = 0;
  public readonly skeletonItems = [1, 2, 3];
  constructor(
    private learningObjectService: LearningObjectService,
    private breadcrumbService:BreadcrumbService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
    ) {
      this.configureBreadcrumb();
    }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Mantiene el breadcrumb alineado con la subruta privada del listado.
   */
  private async configureBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await firstValueFrom(this.languageService.translate.get("menu.settings"))},
      { label: await firstValueFrom(this.languageService.translate.get("menu.sideMenu.myObjectsA")), routerLink: ["/settings/my-objects"] },
    ]);
  }

  /**
   * Carga la pagina solicitada del listado de OAs del docente.
   */
  async loadData(page: number = 1) {
    this.isLoading = true;
    this.loadError = false;
    this.cdr.detectChanges();

    try {
      const response = await firstValueFrom(this.learningObjectService.getObjectsTeacher(page));
      this.objects = response.results ?? [];
      this.updatePaginationState(response, page);
    } catch (error) {
      this.objects = [];
      this.loadError = true;
      this.totalRecords = 0;
      this.rows = this.pageSize || 0;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Conserva el tamano de pagina usado por el paginator mientras el backend
   * siga devolviendo resultados parciales.
   */
  private updatePaginationState(
    response: ApiPaginatedResponse<ObjectLearning>,
    page: number
  ) {
    this.totalRecords = response.count ?? this.objects.length;

    if (!this.pageSize && this.objects.length > 0) {
      this.pageSize = this.objects.length;
    }

    this.rows = this.pageSize || this.objects.length;
    this.currentPage = Math.max(page - 1, 0);
  }

  paginate(event: PaginatorState) {
    this.loadData((event.page ?? 0) + 1);
  }

  /**
   * Reconsulta el listado cuando una tarjeta confirma una accion destructiva.
   */
  public reloadData(shouldReload: boolean) {
    if (shouldReload) {
      this.loadData();
    }
  }
}
