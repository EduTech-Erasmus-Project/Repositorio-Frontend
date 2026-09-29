import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Table } from "primeng/table";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { LearningObjects } from "../../models/evaluation.models";
import {
  buildManagedAdminUploadDetailPath,
  buildManagedLearningObjectListBreadcrumbs,
} from "../../shared/admin-managed-user.utils";
import { firstValueFrom } from "rxjs";

/**
 * Lista los objetos de aprendizaje cargados por un docente aprobado y expone
 * la navegacion administrativa hacia el detalle de cada OA.
 */
@Component({
  selector: "app-learning-object-upload-list",
  templateUrl: "./learning-object-upload-list.component.html",
  styleUrls: ["./learning-object-upload-list.component.css"],
  standalone: false,
})
export class LearningObjectUploadListComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  public teacherId: number;
  public learningobjects: ObjectLearning[] = [];
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
    this.teacherId = Number(this.activatedRoute.snapshot.params["id"]);
    this.breadcrumbService.setItems(
      buildManagedLearningObjectListBreadcrumbs("teacher", "uploaded")
    );
  }

  ngOnInit(): void {
    void this.loadLearningObjects();
  }

  /**
   * Recupera el historial de OAs cargados por el docente seleccionado.
   */
  public async loadLearningObjects(): Promise<void> {
    this.isLoading = true;
    this.refreshView();

    try {
      const response = await firstValueFrom(
        this.administratorService.listLearningObjectUploadByTeacher(this.teacherId)
      );
      const normalizedResponse = normalizeCollectionResponse(response);
      this.learningobjects = normalizedResponse.items as ObjectLearning[];
    } catch {
      this.learningobjects = [];
    } finally {
      this.isLoading = false;
      this.hasLoaded = true;
      this.refreshView();
    }
  }

  public getLearningObjectDetail(slug: string): void {
    this.router.navigate([buildManagedAdminUploadDetailPath(slug)]);
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
