import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { ExpertEvaluationAdminListItemResponse } from "src/app/core/interfaces/api-contracts";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { AdminComponent } from "../../admin.component";
import { LearningObjects } from "../../models/evaluation.models";
import { EvaluationService } from "../../services/evaluation.service";
import { buildLearningObjectEvaluationBreadcrumbs } from "../../shared/admin-managed-user.utils";
import {
  getPriorityActionClass,
  getPriorityActionLabel,
  getPublicationStatusLabel,
  getPublicationStatusSeverity,
  joinFullName,
} from "../../shared/admin-status.utils";

interface ExpertEvaluationAdminView extends ExpertEvaluationAdminListItemResponse {
  displayRating: string;
  isUpdatingPriority: boolean;
}

/**
 * Lista las evaluaciones expertas de un OA y permite definir cual queda como
 * prioritaria dentro del flujo administrativo.
 */
@Component({
  selector: "app-learning-object-qualificate-expert",
  templateUrl: "./learning-object-qualificate-expert.component.html",
  styleUrls: ["./learning-object-qualificate-expert.component.scss"],
  styles: [
    `
      @media screen and (max-width: 960px) {
        :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
        }
      }
    `,
  ],
  providers: [MessageService, ConfirmationService],
  standalone: false,
})
export class LearningObjectQualificateExpertListComponent implements OnInit {
  public learningobjectList: ExpertEvaluationAdminView[] = [];
  public isLoading = true;
  public showEvaluationDialog = false;
  public activeEvaluation: ExpertEvaluationAdminView | null = null;
  public learningobjectsSelected: LearningObjects[] = [];
  private id_learningobject = 0;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    public readonly appMain: AdminComponent,
    private readonly confirmationService: ConfirmationService,
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
      buildLearningObjectEvaluationBreadcrumbs(this.id_learningobject, "expert")
    );
  }

  ngOnInit(): void {
    void this.loadEvaluations();
  }

  /**
   * Recupera y normaliza las evaluaciones expertas del OA actual.
   */
  private async loadEvaluations(): Promise<void> {
    this.isLoading = true;

    try {
      const response = await firstValueFrom(
        this.evaluationsService.get_qualification_expert_results(this.id_learningobject)
      );
      const normalizedResponse = normalizeCollectionResponse(response);
      const data = normalizedResponse.items.map((item) => this.mapExpertEvaluation(item));

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
        detail: "No se pudieron cargar las evaluaciones de expertos.",
      });
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  public readonly getStatusLabel = getPublicationStatusLabel;
  public readonly getStatusSeverity = getPublicationStatusSeverity;
  public readonly join_last_name_first_name = joinFullName;
  public readonly class_color = getPriorityActionClass;
  public readonly name_label = getPriorityActionLabel;

  /**
   * Confirma la priorizacion de una evaluacion experta y recarga el bloque
   * para reflejar el nuevo estado prioritario.
   */
  public confirm(event: Event, evaluation: ExpertEvaluationAdminView): void {
    if (evaluation.is_priority) {
      return;
    }

    this.confirmationService.confirm({
      target: event.target as HTMLElement,
      message: "¿Está seguro de que desea priorizar esta calificación?",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        evaluation.isUpdatingPriority = true;

        try {
          const result = await firstValueFrom(
            this.evaluationsService.update_qualification_expert_results(evaluation.id, {
              is_priority: "True",
            })
          );

          if (Number(result?.status) === 200 || Number(result?.code) === 200) {
            this.messageService.add({
              severity: "success",
              summary: "Exitoso",
              detail: "Evaluación prioritaria actualizada.",
            });
            await this.loadEvaluations();
            return;
          }

          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Error al tratar de actualizar el registro.",
          });
        } catch {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Error al tratar de actualizar el registro.",
          });
        } finally {
          evaluation.isUpdatingPriority = false;
          this.cdr.detectChanges();
        }
      },
      reject: () => {
        this.messageService.add({
          severity: "info",
          summary: "Cancelado",
          detail: "No se actualizó la prioridad.",
        });
      },
    });
  }

  public openEvaluationDialog(evaluation: ExpertEvaluationAdminView): void {
    this.activeEvaluation = evaluation;
    this.showEvaluationDialog = true;
    this.cdr.detectChanges();
  }

  public closeEvaluationDialog(): void {
    this.showEvaluationDialog = false;
    this.activeEvaluation = null;
    this.cdr.detectChanges();
  }

  public change_value(event: boolean): void {
    if (event === false) {
      this.closeEvaluationDialog();
    }
  }

  private mapExpertEvaluation(
    item: ExpertEvaluationAdminListItemResponse
  ): ExpertEvaluationAdminView {
    return {
      ...item,
      displayRating: Number(item.rating || 0).toFixed(2),
      isUpdatingPriority: false,
    };
  }
}
