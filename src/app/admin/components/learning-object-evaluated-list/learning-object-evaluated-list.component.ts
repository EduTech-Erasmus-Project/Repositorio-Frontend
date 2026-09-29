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
import {
  ExpertEvaluationAdminListItemResponse,
} from "src/app/core/interfaces/api-contracts";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { LearningObjects } from "../../models/evaluation.models";
import {
  buildManagedAdminEvaluatedDetailPath,
  buildManagedLearningObjectListBreadcrumbs,
  ManagedAdminRole,
  resolveManagedAdminRoleFromRoute,
} from "../../shared/admin-managed-user.utils";

/**
 * Lista los objetos evaluados por un docente o experto aprobado y permite
 * navegar hacia el detalle consolidado de cada evaluacion.
 */
@Component({
  selector: "app-learning-object-evaluated-list",
  templateUrl: "./learning-object-evaluated-list.component.html",
  styleUrls: ["./learning-object-evaluated-list.component.css"],
  standalone: false,
})
export class LearningObjectEvaluatedListComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  public expertId: number;
  public adminRole: ManagedAdminRole;
  public learningobjects: ExpertEvaluationAdminListItemResponse[] = [];
  public isLoading = true;
  public hasLoaded = false;
  public learningobjectsSelected: LearningObjects[] = [];

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly administratorService: AdministratorService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.expertId = Number(this.activatedRoute.snapshot.params["id"]);
    this.adminRole = resolveManagedAdminRoleFromRoute(
      this.activatedRoute.snapshot.routeConfig?.path
    );
    this.breadcrumbService.setItems(
      buildManagedLearningObjectListBreadcrumbs(this.adminRole, "evaluated")
    );
  }

  ngOnInit(): void {
    void this.loadLearningObjects();
  }

  /**
   * Recupera el listado de OAs evaluados por el usuario aprobado actual.
   */
  public async loadLearningObjects(): Promise<void> {
    this.isLoading = true;
    this.refreshView();

    try {
      const response = await firstValueFrom(
        this.administratorService.getLearningObjectEvaluatedByExpert(this.expertId)
      );
      const normalizedResponse = normalizeCollectionResponse(response);
      this.learningobjects =
        normalizedResponse.items as ExpertEvaluationAdminListItemResponse[];
    } catch {
      this.learningobjects = [];
    } finally {
      this.isLoading = false;
      this.hasLoaded = true;
      this.refreshView();
    }
  }

  public getLearningObjectDetail(slug: string): void {
    this.router.navigate([
      buildManagedAdminEvaluatedDetailPath(this.adminRole, this.expertId, slug),
    ]);
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
