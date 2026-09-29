import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import {
  Concept,
  Question,
  QuestionUpdate,
} from "../../models/evaluation.models";
import {
  getRequestErrorMessage,
  hasTextValue,
  normalizeTrimmedText,
} from "../../shared/admin-form.utils";

interface ExpertConceptDetailResponse {
  questions?: Question[];
}

interface RequestStatusResponse {
  message?: string;
  code?: number;
  status?: number;
}

/**
 * Administra el catalogo de conceptos y preguntas de evaluacion experta,
 * incluyendo alta, edicion, eliminacion y consulta del detalle por concepto.
 */
@Component({
  selector: "app-expert-question-create-list",
  templateUrl: "./expert-question-create-list.component.html",
  styleUrls: ["./expert-question-create-list.component.scss"],
  providers: [MessageService, ConfirmationService],
  standalone: false,
})
export class ExpertQuestionCreateListComponent implements OnInit {
  conceptList: Concept[] = [];
  questionList: Question[] = [];
  concept: Concept = new Concept();
  idSelectedConcept: number | null = null;
  conceptSelect: Concept = new Concept();
  questionSelect: QuestionUpdate = new QuestionUpdate();
  question: Question = new Question();

  questionDialog = false;
  editConceptDialog = false;
  createConceptDialog = false;
  updateQuestionDialog = false;
  submitted = false;
  actionLoading: string | null = null;

  constructor(
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private administratorServices: AdministratorService,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Preguntas de evaluacion para el experto",
        routerLink: ["/admin/expert/question"],
      },
    ]);
  }

  ngOnInit() {
    void this.getEvaluationExpert();
  }

  public get busy(): boolean {
    return this.actionLoading !== null;
  }

  public isActionLoading(action: string): boolean {
    return this.actionLoading === action;
  }

  /**
   * Recupera el catalogo de conceptos de evaluacion para expertos.
   */
  async getEvaluationExpert() {
    try {
      this.conceptList = (await firstValueFrom(
        this.administratorServices.getEvaluationExpert()
      )) || [];
      this.refreshView();
    } catch (err: unknown) {
      this.showRequestError(err, "No se pudo cargar la lista de conceptos.");
    }
  }

  openNew() {
    this.concept = new Concept();
    this.submitted = false;
    this.createConceptDialog = true;
  }

  deleteEvaluationExpert(event: Event, id: number) {
    this.confirmDeleteAction(event, () => {
      void this.runAction("delete-concept", async () => {
        await firstValueFrom(this.administratorServices.deleteEvaluationExpert(id));
        await this.getEvaluationExpert();
        if (this.idSelectedConcept === id) {
          this.questionList = [];
          this.idSelectedConcept = null;
        }
        this.showSuccess("Eliminado correctamente.");
      });
    });
  }

  private confirmDeleteAction(event: Event, accept: () => void) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target as EventTarget,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept,
    });
  }

  hideDialogUpdate() {
    this.editConceptDialog = false;
    this.submitted = false;
  }

  hideDialogUpdateQuestion() {
    this.updateQuestionDialog = false;
    this.submitted = false;
  }

  hideDialog() {
    this.questionDialog = false;
    this.submitted = false;
    this.resetQuestionForm();
  }

  hideDialogConcept() {
    this.createConceptDialog = false;
    this.submitted = false;
    this.concept = new Concept();
  }

  openEditConceptDialog(concept: Concept) {
    this.conceptSelect = { ...concept };
    this.submitted = false;
    this.editConceptDialog = true;
  }

  openEditQuestionDialog(question: Question) {
    this.questionSelect = { ...question };
    this.submitted = false;
    this.updateQuestionDialog = true;
  }

  async updateConcept() {
    this.submitted = true;
    const conceptName = normalizeTrimmedText(this.conceptSelect?.concept);

    if (!conceptName) {
      this.showValidation("Ingrese el concepto de evaluacion.");
      return;
    }

    await this.runAction("update-concept", async () => {
      const payload = { ...this.conceptSelect, concept: conceptName };
      await firstValueFrom(this.administratorServices.putEvaluationExpert(payload));
      this.conceptSelect = payload;
      this.editConceptDialog = false;
      this.submitted = false;
      await this.getEvaluationExpert();
      this.showSuccess("Concepto actualizado correctamente.");
    });
  }

  openQuestion(concept: Concept) {
    this.conceptSelect = { ...concept };
    this.resetQuestionForm();
    this.submitted = false;
    this.questionDialog = true;
  }

  private resetQuestionForm() {
    this.question = new Question();
  }

  isRequiredInvalid(value: unknown): boolean {
    return this.submitted && !hasTextValue(value);
  }

  private isQuestionFormValid(question: Partial<Question | QuestionUpdate>): boolean {
    return (
      hasTextValue(question.question) &&
      hasTextValue(question.code) &&
      hasTextValue(question.schema) &&
      hasTextValue(question.interpreter_yes) &&
      hasTextValue(question.interpreter_partially) &&
      hasTextValue(question.interpreter_no) &&
      hasTextValue(question.weight) &&
      hasTextValue(question.relevance) &&
      hasTextValue(question.description)
    );
  }

  saveQuestion() {
    this.submitted = true;

    if (!this.isQuestionFormValid(this.question)) {
      this.showValidation("Complete los campos obligatorios de la pregunta.");
      return;
    }

    if (!this.conceptSelect.id) {
      this.showRequestError(null, "Seleccione un concepto antes de crear la pregunta.");
      return;
    }

    void this.runAction("create-question", async () => {
      const payload = {
        ...this.normalizeQuestionPayload(this.question),
        evaluation_concept: this.conceptSelect.id,
      } as unknown as Question;

      await firstValueFrom(this.administratorServices.postQuestionExpert(payload));
      await this.refreshSelectedQuestions();
      this.questionDialog = false;
      this.resetQuestionForm();
      this.submitted = false;
      this.showSuccess("Pregunta creada correctamente.");
    });
  }

  registerEvaluationData() {
    this.submitted = true;

    const conceptName = normalizeTrimmedText(this.concept?.concept);
    if (!conceptName) {
      this.showValidation("Ingrese el concepto de evaluacion.");
      return;
    }

    void this.runAction("create-concept", async () => {
      const payload = { ...this.concept, concept: conceptName } as Concept;
      await firstValueFrom(this.administratorServices.postEvaluationExpert(payload));
      await this.getEvaluationExpert();
      this.concept = new Concept();
      this.createConceptDialog = false;
      this.submitted = false;
      this.showSuccess("Concepto de evaluacion creado correctamente.");
    });
  }

  saveUpdateQuestion() {
    this.submitted = true;

    if (!this.isQuestionFormValid(this.questionSelect)) {
      this.showValidation("Complete los campos obligatorios de la pregunta.");
      return;
    }

    void this.runAction("update-question", async () => {
      const payload = this.normalizeQuestionPayload(this.questionSelect) as unknown as QuestionUpdate;
      const data = await firstValueFrom(
        this.administratorServices.updateQuestionExpert(payload)
      ) as unknown as RequestStatusResponse;

      if (data?.message && data.message !== "success") {
        this.showRequestError(null, "No se pudo actualizar el registro.");
        return;
      }

      this.questionSelect = payload;
      this.updateQuestionDialog = false;
      this.submitted = false;
      await this.refreshSelectedQuestions();
      this.showSuccess("Pregunta actualizada correctamente.");
    });
  }

  async getRetrieveQuestion(id: number) {
    try {
      const data = await firstValueFrom(
        this.administratorServices.retrieveEvaluationExpert(id)
      ) as ExpertConceptDetailResponse;
      this.questionList = data?.questions || [];
      this.idSelectedConcept = id;
      this.refreshView();
    } catch (err: unknown) {
      this.showRequestError(err, "No se pudieron cargar las preguntas.");
    }
  }

  retrieveEvaluationData(id: number) {
    void this.getRetrieveQuestion(id);
  }

  deleteQuestion(event: Event, id: number) {
    this.confirmDeleteAction(event, () => {
      void this.runAction("delete-question", async () => {
        await firstValueFrom(this.administratorServices.deleteQuestionExpert(id));
        await this.refreshSelectedQuestions();
        this.showSuccess("Eliminado correctamente.");
      });
    });
  }

  private async refreshSelectedQuestions() {
    if (this.idSelectedConcept) {
      await this.getRetrieveQuestion(this.idSelectedConcept);
    }
  }

  private normalizeQuestionPayload(question: Partial<Question | QuestionUpdate>) {
    return {
      ...question,
      question: normalizeTrimmedText(question.question),
      code: normalizeTrimmedText(question.code),
      schema: normalizeTrimmedText(question.schema),
      interpreter_yes: normalizeTrimmedText(question.interpreter_yes),
      interpreter_partially: normalizeTrimmedText(question.interpreter_partially),
      interpreter_no: normalizeTrimmedText(question.interpreter_no),
      weight: Number(question.weight ?? 0),
      relevance: normalizeTrimmedText(question.relevance),
      description: normalizeTrimmedText(question.description),
    };
  }

  private async runAction(action: string, callback: () => Promise<void>) {
    if (this.busy) {
      return;
    }

    this.actionLoading = action;
    try {
      await callback();
    } catch (err: unknown) {
      const fallback =
        action === "create-concept"
          ? "No se pudo crear el concepto de evaluacion."
          : action === "update-concept"
            ? "No se pudo actualizar el concepto."
            : action === "create-question"
              ? "No se pudo crear la pregunta."
              : action === "delete-concept"
                ? "No se pudo eliminar el concepto."
                : action === "delete-question"
                  ? "No se pudo eliminar la pregunta."
                  : "No se pudo actualizar la pregunta.";
      this.showRequestError(err, fallback);
    } finally {
      this.actionLoading = null;
      this.refreshView();
    }
  }

  private showValidation(detail: string) {
    this.messageService.add({
      severity: "warn",
      summary: "Validacion",
      detail,
    });
  }

  private showSuccess(detail: string) {
    this.messageService.add({
      severity: "success",
      summary: "Exito",
      detail,
    });
  }

  private showRequestError(err: unknown, fallback: string) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: getRequestErrorMessage(err, fallback),
    });
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
