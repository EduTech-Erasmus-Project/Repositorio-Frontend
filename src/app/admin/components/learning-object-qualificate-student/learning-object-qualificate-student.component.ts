import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { StudentEvaluationAdminListItemResponse } from "src/app/core/interfaces/api-contracts";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { AdminComponent } from "../../admin.component";
import { LearningObjects } from "../../models/evaluation.models";
import { EvaluationService } from "../../services/evaluation.service";
import { buildLearningObjectEvaluationBreadcrumbs } from "../../shared/admin-managed-user.utils";
import {
  getPublicationStatusLabel,
  getPublicationStatusSeverity,
  joinFullName,
} from "../../shared/admin-status.utils";

interface StudentEvaluationAdminView extends StudentEvaluationAdminListItemResponse {
  displayRating: string;
}

/**
 * Lista las evaluaciones estudiantiles de un OA y abre su detalle en un
 * dialogo administrativo desacoplado de la fila del `p-table`.
 */
@Component({
  selector: "app-learning-object-qualificate-student",
  templateUrl: "./learning-object-qualificate-student.component.html",
  styleUrls: ["./learning-object-qualificate-student.component.scss"],
  styles: [
    `
      @media screen and (max-width: 960px) {
        :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
        }
      }
    `,
  ],
  providers: [MessageService],
  standalone: false,
})
export class LearningObjectQualificateStudentListComponent implements OnInit {
  public learningobjectList: StudentEvaluationAdminView[] = [];
  public isLoading = true;
  public showDetailDialog = false;
  public activeEvaluation: StudentEvaluationAdminView | null = null;
  public learningobjectsSelected: LearningObjects[] = [];
  private id_learningobject = 0;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    public readonly appMain: AdminComponent,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly evaluationsService: EvaluationService,
    private readonly activeRoute: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {
    if (isNaN(+this.activeRoute?.snapshot.params?.id)) {
      this.router.navigate(["/admin/learning-object/approved"]);
      return;
    }

    this.id_learningobject = +this.activeRoute.snapshot.params.id;
    this.breadcrumbService.setItems(
      buildLearningObjectEvaluationBreadcrumbs(this.id_learningobject, "student")
    );
  }

  ngOnInit(): void {
    void this.loadEvaluations();
  }

  /**
   * Recupera y normaliza las evaluaciones estudiantiles del OA actual.
   */
  private async loadEvaluations(): Promise<void> {
    this.isLoading = true;

    try {
      const response = await firstValueFrom(
        this.evaluationsService.get_qualification_student_results(this.id_learningobject)
      );
      const normalizedResponse = normalizeCollectionResponse(response);
      const data = normalizedResponse.items.map((item) => this.mapStudentEvaluation(item));

      if (data.length === 0) {
        this.router.navigate(["/admin/learning-object/approved"]);
        return;
      }

      this.learningobjectList = data;
      this.cdr.detectChanges();
    } catch {
      this.learningobjectList = [];
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las evaluaciones de estudiantes.",
      });
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  public readonly getStatusLabel = getPublicationStatusLabel;
  public readonly getStatusSeverity = getPublicationStatusSeverity;
  public readonly join_last_name_first_name = joinFullName;

  public openEvaluationDialog(evaluation: StudentEvaluationAdminView): void {
    this.activeEvaluation = evaluation;
    this.showDetailDialog = true;
    this.cdr.detectChanges();
  }

  public closeEvaluationDialog(): void {
    this.showDetailDialog = false;
    this.activeEvaluation = null;
    this.cdr.detectChanges();
  }

  public change_value(event: boolean): void {
    if (event === false) {
      this.closeEvaluationDialog();
    }
  }

  private mapStudentEvaluation(
    item: StudentEvaluationAdminListItemResponse
  ): StudentEvaluationAdminView {
    return {
      ...item,
      displayRating: Number(item.rating || 0).toFixed(2),
    };
  }
}
