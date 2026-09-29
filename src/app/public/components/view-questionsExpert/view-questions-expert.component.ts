import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormRecord, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { MessageService } from "primeng/api";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import {
  ExpertConceptResponse,
  ExpertEvaluationResultResponse,
} from "src/app/core/interfaces/api-contracts";
import { LanguageService } from "src/app/services/language.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";

interface AnswerOption {
  labelKey: string;
  value: string;
}

interface ExpertQuestion {
  id: number;
  question: string;
  description?: string;
  schema?: string;
  qualification?: string;
}

interface ExpertConceptGroup {
  id: number;
  label: string;
  questions: ExpertQuestion[];
}

type ExpertEvaluationForm = FormRecord<FormControl<string | null>>;

/**
 * Gestiona el formulario experto de evaluacion del OA en modo crear o actualizar.
 *
 * Responsabilidades:
 * - Construir preguntas agrupadas por concepto desde el backend.
 * - Persistir respuestas del experto con validacion obligatoria.
 * - Notificar a la vista contenedora cuando la evaluacion cambia de estado.
 */
@Component({
  selector: "app-view-questions-expert",
  templateUrl: "./view-questions-expert.component.html",
  styleUrls: ["./view-questions-expert.component.scss"],
  standalone: false
})
export class ViewQuestionsExpertComponent implements OnInit {
  @Input() object!: ObjectLearning;
  @Output() commentEmit = new EventEmitter<boolean>();
  @Output() commentEmit1 = new EventEmitter<boolean>();
  @Input() flagQuestionsEx = false;

  public groupedQuestionsEx: ExpertConceptGroup[] = [];
  public angForm: ExpertEvaluationForm = new FormRecord<FormControl<string | null>>({});
  public flagConfirm = false;
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
    private learningObject: LearningObjectService,
    private loginService: LoginService,
    private messageServicee: MessageService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.createForm();
    void this.loadData();
  }

  get isUpdateMode(): boolean {
    return !!this.flagQuestionsEx;
  }

  get observation(): FormControl<string | null> | null {
    return this.angForm.get("observation") as FormControl<string | null> | null;
  }

  createForm() {
    this.angForm = new FormRecord<FormControl<string | null>>({
      observation: new FormControl<string | null>(null, { validators: [Validators.required] }),
    });
  }

  async loadData() {
    if (!this.loginService.validateRole("expert")) {
      return;
    }

    if (!this.isUpdateMode) {
      const res = await firstValueFrom(this.searchService.geQuestionsExpert());
      this.groupedQuestionsEx = res.map((item) => this.mapExpertConceptGroup(item));
      this.addQuestionControls(this.groupedQuestionsEx);
      this.cdr.detectChanges();
      return;
    }

    const res = await firstValueFrom(this.learningObject.getObjectResultsEvaluation(this.object.id));
    this.updateEvaluationId = res[0]?.id ?? null;
    this.groupedQuestionsEx = this.mapExpertEvaluationGroups(res);
    this.groupedQuestionsEx.forEach((group) => {
      group.questions.forEach((question) => {
        this.addQuestionControl(question.id, question.qualification || null);
      });
    });
    this.observation?.setValue(res[0]?.observation ?? null);
    this.cdr.detectChanges();
  }

  async sendAnswersExcpert() {
    if (this.angForm.invalid || this.isSaving) {
      this.markTouchForm();
      if (!this.isSaving) {
        this.showError(await firstValueFrom(this.languageService.translate.get("object.fillForm")));
      }
      return;
    }

    const payload = {
      id: this.updateEvaluationId,
      learning_object: this.object.id,
      results: Object.entries(this.angForm.getRawValue())
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
        await firstValueFrom(this.learningObject.sendQualificationExpert(payload));
        this.commentEmit1.emit(true);
        this.flagConfirm = true;
        this.angForm.reset();
        this.showSuccess(
          await firstValueFrom(this.languageService.translate.get("object.evaluationMessage"))
        );
        return;
      }

      await firstValueFrom(
        this.learningObject.sendQualificationExpertUpdate(payload, this.updateEvaluationId as number)
      );
      this.showSuccess(
        await firstValueFrom(this.languageService.translate.get("object.successSendData"))
      );
      this.commentEmit.emit(false);
    } catch {
      this.flagConfirm = false;
      this.showError(
        await firstValueFrom(this.languageService.translate.get("object.messageErrorUpdate"))
      );
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  showError(message: string) {
    this.messageServicee.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  }

  showSuccess(message: string) {
    this.messageServicee.add({
      severity: "success",
      summary: "Success",
      detail: message,
    });
  }

  markTouchForm() {
    Object.values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  closeView() {
    if (!this.isUpdateMode) {
      this.angForm.reset();
    }

    this.commentEmit.emit(false);
  }

  setValueReturnForm(value: number) {
    return this.angForm.get(String(value));
  }

  trackByGroup(index: number, item: ExpertConceptGroup) {
    return item.id;
  }

  trackByQuestion(index: number, item: ExpertQuestion) {
    return item.id;
  }

  trackByAnswerOption(index: number, item: AnswerOption) {
    return item.value;
  }

  private addQuestionControls(groups: ExpertConceptGroup[]) {
    groups.forEach((group) => {
      group.questions.forEach((question) => {
        this.addQuestionControl(question.id);
      });
    });
  }

  private addQuestionControl(controlName: number, initialValue: string | null = null) {
    const name = String(controlName);

    if (this.angForm.contains(name)) {
      return;
    }

    this.angForm.addControl(
      name,
      new FormControl<string | null>(initialValue, { validators: [Validators.required] })
    );
  }

  private mapExpertConceptGroup(item: ExpertConceptResponse): ExpertConceptGroup {
    return {
      id: item.id,
      label: item.concept,
      questions: (item.questions || []).map((question) => ({
        id: question.id,
        question: question.question,
        description: question.description,
        schema: question.schema,
      })),
    };
  }

  private mapExpertEvaluationGroups(
    results: ExpertEvaluationResultResponse[]
  ): ExpertConceptGroup[] {
    return results.reduce<ExpertConceptGroup[]>((groups, evaluation) => {
      const mappedGroups = (evaluation.concept_evaluations || []).map((conceptEvaluation) => ({
        id: conceptEvaluation.evaluation_concept?.id || conceptEvaluation.id || 0,
        label: conceptEvaluation.evaluation_concept?.concept || "",
        questions: (conceptEvaluation.question_evaluations || []).map((questionEvaluation) => ({
          id: questionEvaluation.question_id || questionEvaluation.id || 0,
          question: questionEvaluation.question || "",
          qualification: questionEvaluation.qualification || "",
        })),
      }));

      return groups.concat(mappedGroups);
    }, []);
  }
}
