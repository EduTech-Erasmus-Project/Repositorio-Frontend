import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewRef } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { StudentEvaluationResultResponse } from "src/app/core/interfaces/api-contracts";
import { EvaluationService } from "../../services/evaluation.service";

interface StudentEvaluationQuestionView {
  value: number;
  question_id: number;
  question: string;
  qualification: string;
}

interface StudentEvaluationGuidelineView {
  guideline_pr: string;
  guideline_evaluations: StudentEvaluationQuestionView[];
}

interface StudentEvaluationPrincipleView {
  idevaluation: number;
  evaluation_principle: string;
  principle_gl: StudentEvaluationGuidelineView[];
}

interface StudentEvaluationResultView {
  id: number;
  observation: string;
  evaluation_students: StudentEvaluationPrincipleView[];
}

/**
 * Renderiza en modo solo lectura el detalle de una evaluacion estudiantil
 * dentro del dialogo administrativo de calificadores.
 */
@Component({
    selector: "app-view-student-evaluations-admin",
    templateUrl: "./view-student-evaluations-admin.component.html",
    styleUrls: ["./view-student-evaluations-admin.component.scss"],
    standalone: false
})
export class ViewStudentEvaluationsAdminComponent implements OnInit {
  public groupedQuestionsUpdate: StudentEvaluationResultView[] = [];
  public isLoading = true;

  @Input() student_id!: number;
  @Input() oa_id!: number;
  @Output() displayFormRatingStuden = new EventEmitter<boolean>();

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

  closeView2() {
    this.displayFormRatingStuden.emit(false);
  }

  private async loadEvaluations(): Promise<void> {
    this.isLoading = true;

    try {
      const res = await firstValueFrom(
        this.evaluationsService.getObjectResultsEvaluationStudentResult_Admin(this.student_id, this.oa_id)
      );
      this.groupedQuestionsUpdate = (res || []).map((item) => this.mapStudentEvaluationResult(item));
      this.refreshView();
    } catch {
      this.groupedQuestionsUpdate = [];
    } finally {
      this.isLoading = false;
      this.refreshView();
    }
  }

  private mapStudentEvaluationResult(item: StudentEvaluationResultResponse): StudentEvaluationResultView {
    return {
      id: item.id,
      observation: item.observation || "",
      evaluation_students: (item.evaluation_students || []).map((evaluation) => ({
        idevaluation: evaluation.id,
        evaluation_principle: evaluation.evaluation_principle?.principle || "",
        principle_gl: (evaluation.principle_gl || []).map((guideline) => ({
          guideline_pr: guideline.guideline_pr?.guideline || "",
          guideline_evaluations: (guideline.guideline_evaluations || []).map((question) => ({
            value: question.id || question.question_id,
            question_id: question.question_id,
            question: question.question,
            qualification: question.qualification,
          })),
        })),
      })),
    };
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
