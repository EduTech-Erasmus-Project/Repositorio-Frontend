import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewRef } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ExpertEvaluationResultResponse } from "src/app/core/interfaces/api-contracts";
import { EvaluationService } from "../../services/evaluation.service";

interface ExpertEvaluationQuestionView {
  value: number;
  questions: string;
  qualification: string;
  questionid: number;
}

interface ExpertEvaluationConceptView {
  evaluationConcept: string;
  questionEvaluations: ExpertEvaluationQuestionView[];
}

interface ExpertEvaluationResultView {
  conceptEvaluations: ExpertEvaluationConceptView[];
  observation: string;
  id: number;
}

/**
 * Renderiza en modo solo lectura el detalle de una evaluacion experta dentro
 * del dialogo administrativo de calificadores.
 */
@Component({
    selector: "app-view-expert-evaluations-admin",
    templateUrl: "./view-expert-evaluations-admin.component.html",
    styleUrls: ["./view-expert-evaluations-admin.component.scss"],
    standalone: false
})
export class ViewExpertEvaluationsAdminComponent implements OnInit {
  public groupedQuestionsEx: ExpertEvaluationResultView[] = [];
  public isLoading = true;

  @Input() student_id!: number;
  @Input() oa_id!: number;
  @Output() displayFormRatingExpert = new EventEmitter<boolean>();

  public readonly qualificationOptions = [
    { value: "Si", labelKey: "register.yes" },
    { value: "No", labelKey: "register.no" },
    { value: "Parcialmente", labelKey: "register.partially" },
    { value: "No aplica", labelKey: "register.notApply" },
  ];

  constructor(private evaluationsService: EvaluationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    void this.loadEvaluations();
  }

  public getQualificationLabel(value: string): string {
    const option = this.qualificationOptions.find((item) => item.value === value);
    return option?.value || value || "Sin respuesta";
  }

  closeView() {
    this.displayFormRatingExpert.emit(false);
  }

  private async loadEvaluations(): Promise<void> {
    this.isLoading = true;

    try {
      const res = await firstValueFrom(
        this.evaluationsService.getObjectResultsEvaluationExpertResult_Admin(this.student_id, this.oa_id)
      );
      this.groupedQuestionsEx = (res || []).map((item) => this.mapExpertEvaluationResult(item));
      this.refreshView();
    } catch {
      this.groupedQuestionsEx = [];
    } finally {
      this.isLoading = false;
      this.refreshView();
    }
  }

  private mapExpertEvaluationResult(item: ExpertEvaluationResultResponse): ExpertEvaluationResultView {
    return {
      conceptEvaluations: (item.concept_evaluations || []).map((conceptEvaluation) => ({
        evaluationConcept: conceptEvaluation.evaluation_concept?.concept || "",
        questionEvaluations: (conceptEvaluation.question_evaluations || []).map((questionEvaluation) => ({
          value: questionEvaluation.id || questionEvaluation.question_id || 0,
          questions: questionEvaluation.question || "",
          qualification: questionEvaluation.qualification || "",
          questionid: questionEvaluation.question_id || 0,
        })),
      })),
      observation: item.observation || "",
      id: item.id || 0,
    };
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
