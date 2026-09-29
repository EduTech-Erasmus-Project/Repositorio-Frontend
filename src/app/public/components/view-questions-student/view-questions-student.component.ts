import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormRecord, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { MessageService } from "primeng/api";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import {
  StudentEvaluationResultResponse,
  StudentPrincipleResponse,
} from "src/app/core/interfaces/api-contracts";
import { LanguageService } from "src/app/services/language.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";

interface AnswerOption {
  labelKey: string;
  value: string;
}

interface StudentQuestion {
  id: number;
  question: string;
  description?: string;
}

interface StudentGuideline {
  id?: number;
  label: string;
  questions: StudentQuestion[];
}

interface StudentPrincipleGroup {
  id: number;
  label: string;
  guidelines: StudentGuideline[];
}

type StudentEvaluationForm = FormRecord<FormControl<string | null>>;

/**
 * Gestiona el formulario estudiantil de evaluacion del OA, tanto en alta como en actualizacion.
 *
 * Responsabilidades:
 * - Construir controles dinamicos desde principios, pautas y preguntas.
 * - Enviar payloads de creacion o actualizacion al backend.
 * - Emitir al contenedor cuando cambia el estado de la evaluacion estudiantil.
 */
@Component({
  selector: "app-view-questions-student",
  templateUrl: "./view-questions-student.component.html",
  styleUrls: ["./view-questions-student.component.scss"],
  standalone: false
})
export class ViewQuestionsStudentComponent implements OnInit {
  @Input() object!: ObjectLearning;
  @Output() commentEmit1 = new EventEmitter<boolean>();
  @Output() commentEmit = new EventEmitter<boolean>();
  @Input() flagQuestionsEst = false;

  public groupedQuestionsSTUDENT: StudentPrincipleGroup[] = [];
  public groupedQuestionsUpdate: StudentPrincipleGroup[] = [];
  public angForm2: StudentEvaluationForm = new FormRecord<FormControl<string | null>>({});
  public flagConfirmSt = false;
  public updateEvaluationId: number | null = null;
  public isSaving = false;

  public readonly answerOptions: AnswerOption[] = [
    { labelKey: "register.yes", value: "Si" },
    { labelKey: "register.no", value: "No" },
    { labelKey: "register.partially", value: "Parcialmente" },
    { labelKey: "register.notApply", value: "No aplica" },
  ];

  constructor(
    private searchService: SearchService,
    private loginService: LoginService,
    private messageServicee: MessageService,
    private learningObject: LearningObjectService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.createForm2();
    void this.loadData();
  }

  get isUpdateMode(): boolean {
    return !!this.flagQuestionsEst;
  }

  get observation(): FormControl<string | null> | null {
    return this.angForm2.get("observation") as FormControl<string | null> | null;
  }

  createForm2() {
    this.angForm2 = new FormRecord<FormControl<string | null>>({
      observation: new FormControl<string | null>(null, { validators: [Validators.required] }),
    });
  }

  async loadData() {
    if (this.loginService.validateRole("student") && !this.isUpdateMode) {
      const res = await firstValueFrom(this.searchService.geQuestionsStudent());
      this.groupedQuestionsSTUDENT = res.map((principle) => this.mapStudentPrincipleGroup(principle));
      this.addQuestionControls(this.groupedQuestionsSTUDENT);
      this.cdr.detectChanges();
      return;
    }

    if (!this.isUpdateMode) {
      return;
    }

    const res = await firstValueFrom(
      this.searchService.getObjectResultsEvaluationStudent(this.object.id)
    );
    this.updateEvaluationId = res[0]?.id ?? null;
    this.groupedQuestionsUpdate = this.mapStudentEvaluationGroups(res);

    res.forEach((evaluation) => {
      evaluation.evaluation_students.forEach((studentEvaluation) => {
        studentEvaluation.principle_gl.forEach((guidelineGroup) => {
          guidelineGroup.guideline_evaluations.forEach((evaluationQuestion) => {
            this.addQuestionControl(evaluationQuestion.question_id, evaluationQuestion.qualification);
          });
        });
      });
    });

    this.observation?.setValue(res[0]?.observation ?? null);
    this.cdr.detectChanges();
  }

  closeView() {
    if (!this.isUpdateMode) {
      this.angForm2.reset();
    }

    this.commentEmit1.emit(false);
    this.commentEmit.emit(false);
  }

  closeView2() {
    this.commentEmit.emit(false);
    this.commentEmit1.emit(false);
  }

  getNumber(event: number) {
    return this.angForm2.get(String(event))?.value;
  }

  async sendAnswersStudent() {
    if (this.angForm2.invalid || this.isSaving) {
      this.markTouchForm();
      if (!this.isSaving) {
        this.showError(await firstValueFrom(this.languageService.translate.get("object.fillForm")));
      }
      return;
    }

    const payload = {
      id: this.updateEvaluationId,
      learning_object: this.object.id,
      results: Object.entries(this.angForm2.getRawValue())
        .filter(([key]) => key !== "observation")
        .map(([key, value]) => ({
          id: Number(key),
          value,
        })),
      observation: this.observation?.value,
    };

    this.isSaving = true;

    try {
      if (!this.isUpdateMode) {
        await firstValueFrom(this.learningObject.sendQualificationStudent(payload));
        this.commentEmit1.emit(true);
        this.flagConfirmSt = true;
        this.closeView2();
        this.showSuccess(await firstValueFrom(this.languageService.translate.get("object.evaluationMessage")));
        return;
      }

      await firstValueFrom(
        this.learningObject.sendQualificationStudentUpdate(payload, this.updateEvaluationId as number)
      );
      this.commentEmit.emit(false);
      this.commentEmit1.emit(false);
      this.flagConfirmSt = true;
      this.showSuccess(await firstValueFrom(this.languageService.translate.get("object.successSendData")));
    } catch {
      this.flagConfirmSt = false;
      this.showError(await firstValueFrom(this.languageService.translate.get("object.messageErrorUpdate")));
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  showError(message: string) {
    this.messageServicee.add({ severity: "error", summary: "Error", detail: message });
  }

  showSuccess(message: string) {
    this.messageServicee.add({ severity: "success", summary: "Success", detail: message });
  }

  markTouchForm() {
    Object.values(this.angForm2.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  setValueReturnForm(value: number) {
    return this.angForm2.get(String(value));
  }

  trackByGroup(index: number, item: StudentPrincipleGroup) {
    return item.id;
  }

  trackByGuideline(index: number, item: StudentGuideline) {
    return item.id ?? `${index}-${item.label}`;
  }

  trackByQuestion(index: number, item: StudentQuestion) {
    return item.id;
  }

  trackByAnswerOption(index: number, item: AnswerOption) {
    return item.value;
  }

  private addQuestionControls(groups: StudentPrincipleGroup[]) {
    groups.forEach((principle) => {
      principle.guidelines.forEach((guideline) => {
        guideline.questions.forEach((question) => {
          this.addQuestionControl(question.id);
        });
      });
    });
  }

  private addQuestionControl(controlName: number, initialValue: string | null = null) {
    const name = String(controlName);

    if (this.angForm2.contains(name)) {
      return;
    }

    this.angForm2.addControl(
      name,
      new FormControl<string | null>(initialValue, { validators: [Validators.required] })
    );
  }

  private mapStudentPrincipleGroup(principle: StudentPrincipleResponse): StudentPrincipleGroup {
    return {
      id: principle.id,
      label: principle.principle,
      guidelines: (principle.guidelines || []).map((guideline) => ({
        id: guideline.id,
        label: guideline.guideline,
        questions: (guideline.questions || []).map((question) => ({
          id: question.id,
          question: question.question,
          description: question.description,
        })),
      })),
    };
  }

  private mapStudentEvaluationGroups(
    results: StudentEvaluationResultResponse[]
  ): StudentPrincipleGroup[] {
    return results.reduce<StudentPrincipleGroup[]>((groups, evaluation) => {
      const mappedGroups = (evaluation.evaluation_students || []).map((studentEvaluation) => ({
        id: studentEvaluation.id,
        label: studentEvaluation.evaluation_principle?.principle || "",
        guidelines: (studentEvaluation.principle_gl || []).map((guidelineGroup) => ({
          id: guidelineGroup.guideline_pr?.id,
          label: guidelineGroup.guideline_pr?.guideline || "",
          questions: (guidelineGroup.guideline_evaluations || []).map((evaluationQuestion) => ({
            id: evaluationQuestion.question_id,
            question: evaluationQuestion.question,
          })),
        })),
      }));

      return groups.concat(mappedGroups);
    }, []);
  }
}
