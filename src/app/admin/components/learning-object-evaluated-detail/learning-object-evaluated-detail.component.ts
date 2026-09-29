import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Table } from "primeng/table";
import { firstValueFrom } from "rxjs";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { UserCreated } from "src/app/core/interfaces/UserCreated";
import {
  ExpertConceptEvaluationResponse,
  ExpertEvaluationAdminListItemResponse,
} from "src/app/core/interfaces/api-contracts";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { shouldDisplayLearningObjectMenu } from "src/app/core/utils/learning-object-preview";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import {
  buildManagedLearningObjectListBreadcrumbs,
  resolveManagedAdminRoleFromRoute,
} from "../../shared/admin-managed-user.utils";

type EvaluatedLearningObjectDetailItem = Omit<
  ExpertEvaluationAdminListItemResponse,
  "learning_object"
> & {
  concept_evaluations: ExpertConceptEvaluationResponse[];
  learning_object: ObjectLearning;
};

/**
 * Renderiza el detalle administrativo de un OA evaluado o cargado, incluyendo
 * el visor integrado, metadatos y evaluacion experta cuando aplica.
 */
@Component({
  selector: "app-learning-object-evaluated-detail",
  templateUrl: "./learning-object-evaluated-detail.component.html",
  styleUrls: ["./learning-object-evaluated-detail.component.css"],
  standalone: false,
})
export class LearningObjectEvaluatedDetailComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  public expertId = 0;
  public slug = "";
  public oa: EvaluatedLearningObjectDetailItem | null = null;
  public oaDetail: ObjectLearning | null = null;
  public autor: UserCreated | null = null;
  public index_url = "";
  public readMore = true;
  public showEvaluation = true;
  public disableEvaluation = false;
  public conceptEvaluations: ExpertConceptEvaluationResponse[] = [];
  public youNeedMenu = false;
  public spinner = false;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly administratorService: AdministratorService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.expertId = Number(this.activatedRoute.snapshot.params["expertId"] || 0);
    this.slug = this.activatedRoute.snapshot.params["slug"];

    const routePath = this.activatedRoute.snapshot.routeConfig?.path || "";
    if (routePath.includes("upload/detail")) {
      this.breadcrumbService.setItems([
        ...buildManagedLearningObjectListBreadcrumbs("teacher", "uploaded"),
        { label: "Detalle" },
      ]);
      return;
    }

    this.breadcrumbService.setItems([
      ...buildManagedLearningObjectListBreadcrumbs(
        resolveManagedAdminRoleFromRoute(routePath),
        "evaluated"
      ),
      { label: "Detalle" },
    ]);
  }

  ngOnInit(): void {
    if (this.expertId > 0) {
      this.disableEvaluation = true;
      void this.loadEvaluatedLearningObject();
      return;
    }

    this.disableEvaluation = false;
    void this.loadLearningObjectDetail();
  }

  /**
   * Recupera el OA dentro del listado de evaluaciones del experto para poder
   * mostrar tanto el detalle del recurso como el bloque de evaluacion asociado.
   */
  public async loadEvaluatedLearningObject(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.administratorService.getLearningObjectEvaluatedByExpert(this.expertId)
      );
      const normalizedResponse = normalizeCollectionResponse(response);
      const selectedItem = (normalizedResponse.items as EvaluatedLearningObjectDetailItem[]).find(
        (item) => item.learning_object?.slug === this.slug
      );

      if (!selectedItem) {
        this.router.navigate(["/admin/learning-object/approved"]);
        return;
      }

      this.oa = selectedItem;
      this.oaDetail = selectedItem.learning_object;
      this.autor = this.oaDetail.user_created || null;
      this.conceptEvaluations = selectedItem.concept_evaluations || [];
      this.index_url = this.oaDetail.learning_object_file?.url ?? "";
      this.syncPreviewState();
      this.spinner = true;
    } catch {
      this.router.navigate(["/admin/learning-object/approved"]);
    } finally {
      this.refreshView();
    }
  }

  /**
   * Recupera solo el detalle del OA cuando esta vista se usa como detalle de
   * objetos cargados, sin bloque adicional de evaluacion.
   */
  public async loadLearningObjectDetail(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.administratorService.getLearningObject(this.slug)
      );
      this.oaDetail = response;
      this.autor = response.user_created || null;
      this.index_url = response.learning_object_file?.url ?? "";
      this.syncPreviewState();
      this.spinner = true;
    } catch {
      this.router.navigate(["/admin/learning-object/approved"]);
    } finally {
      this.refreshView();
    }
  }

  public onClick(): void {
    this.readMore = !this.readMore;
  }

  public onClick1(): void {
    this.showEvaluation = !this.showEvaluation;
  }

  private syncPreviewState(): void {
    this.youNeedMenu = shouldDisplayLearningObjectMenu(this.oaDetail);
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
