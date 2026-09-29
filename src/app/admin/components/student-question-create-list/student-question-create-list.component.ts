import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import {
  Guideline,
  GuidelineUpdate,
  Principle,
  QuestionStudent,
  QuestionStudentUpdate,
} from "../../models/evaluation.models";
import {
  getRequestErrorMessage,
  hasTextValue,
  normalizeTrimmedText,
} from "../../shared/admin-form.utils";

interface StudentPrincipleDetailResponse {
  guidelines?: Guideline[];
}

interface StudentGuidelineDetailResponse {
  questions?: QuestionStudent[];
}

interface RequestStatusResponse {
  message?: string;
  code?: number;
  status?: number;
}

/**
 * Administra principios, pautas y preguntas del esquema de evaluacion para
 * estudiantes dentro del modulo administrativo.
 */
@Component({
  selector: "app-student-question-create-list",
  templateUrl: "./student-question-create-list.component.html",
  styleUrls: ["./student-question-create-list.component.scss"],
  providers: [MessageService, ConfirmationService],
  standalone: false,
})
export class StudentQuestionCreateListComponent implements OnInit {
  principleList: Principle[] = [];
  guidelineList: Guideline[] = [];
  questionList: QuestionStudent[] = [];

  principle: Principle = new Principle();
  principleSelect: Principle = new Principle();
  guideline: Guideline = new Guideline();
  guidelineSelect: GuidelineUpdate = new GuidelineUpdate();
  question: QuestionStudent = new QuestionStudent();
  questionSelect: QuestionStudentUpdate = new QuestionStudentUpdate();

  idSelectedPrinciple: number | null = null;
  idSelectedGuideline: number | null = null;

  guidelineDialog = false;
  updateGuidelineDialog = false;
  editPrincipleDialog = false;
  createPrincipleDialog = false;
  questionDialog = false;
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
        label: "Preguntas de evaluacion para el estudiante",
        routerLink: ["/admin/expert/student"],
      },
    ]);
  }

  ngOnInit(): void {
    void this.getEvaluationStudent();
  }

  public get busy(): boolean {
    return this.actionLoading !== null;
  }

  public isActionLoading(action: string): boolean {
    return this.actionLoading === action;
  }

  async getEvaluationStudent() {
    try {
      this.principleList =
        (await firstValueFrom(this.administratorServices.getEvaluationStudent())) || [];
      this.refreshView();
    } catch (err: unknown) {
      this.showRequestError(err, "No se pudo cargar la lista de principios.");
    }
  }

  openNew() {
    this.resetPrincipleForm();
    this.submitted = false;
    this.createPrincipleDialog = true;
  }

  openEditPrincipleDialog(principle: Principle) {
    this.principleSelect = {
      id: principle.id,
      principle: principle.principle,
    };
    this.submitted = false;
    this.editPrincipleDialog = true;
  }

  openGuideline(principle: Principle) {
    this.principleSelect = {
      id: principle.id,
      principle: principle.principle,
    };
    this.resetGuidelineForm();
    this.submitted = false;
    this.guidelineDialog = true;
  }

  openEditGuidelineDialog(guideline: Guideline) {
    this.guidelineSelect = {
      id: guideline.id,
      guideline: guideline.guideline,
    };
    this.submitted = false;
    this.updateGuidelineDialog = true;
  }

  openQuestion(guideline: Guideline) {
    this.guidelineSelect = {
      id: guideline.id,
      guideline: guideline.guideline,
    };
    this.resetQuestionForm();
    this.submitted = false;
    this.questionDialog = true;
  }

  openEditquestionGuidelineDialog(question: QuestionStudent) {
    this.questionSelect = {
      id: question.id,
      question: question.question,
      code: question.code,
      description: question.description,
      metadata: question.metadata,
      interpreter_st_yes: question.interpreter_st_yes,
      interpreter_st_no: question.interpreter_st_no,
      interpreter_st_partially: question.interpreter_st_partially,
      value_st_importance: question.value_st_importance,
      weight: question.weight,
      relevance: question.relevance,
    };
    this.submitted = false;
    this.updateQuestionDialog = true;
  }

  hideDialogPrinciple() {
    this.createPrincipleDialog = false;
    this.submitted = false;
    this.resetPrincipleForm();
  }

  hideDialogUpdate() {
    this.editPrincipleDialog = false;
    this.submitted = false;
    this.principleSelect = new Principle();
  }

  hideDialog() {
    this.guidelineDialog = false;
    this.submitted = false;
    this.resetGuidelineForm();
  }

  hideDialogUpdateGuideline() {
    this.updateGuidelineDialog = false;
    this.submitted = false;
    this.guidelineSelect = new GuidelineUpdate();
  }

  hideDialogquestion() {
    this.questionDialog = false;
    this.submitted = false;
    this.resetQuestionForm();
  }

  hideDialogUpdateQuestion() {
    this.updateQuestionDialog = false;
    this.submitted = false;
    this.questionSelect = new QuestionStudentUpdate();
  }

  registerEvaluationData() {
    this.submitted = true;
    const principleName = normalizeTrimmedText(this.principle.principle);

    if (!principleName) {
      this.showValidation("Ingrese el principio de evaluacion.");
      return;
    }

    void this.runAction("create-principle", async () => {
      const payload = { ...this.principle, principle: principleName } as Principle;
      await firstValueFrom(this.administratorServices.postEvaluationStudent(payload));
      await this.getEvaluationStudent();
      this.hideDialogPrinciple();
      this.showSuccess("Principio creado correctamente.");
    });
  }

  updatePrinciple() {
    this.submitted = true;
    const principleName = normalizeTrimmedText(this.principleSelect.principle);

    if (!principleName) {
      this.showValidation("Ingrese el principio de evaluacion.");
      return;
    }

    void this.runAction("update-principle", async () => {
      const payload = { ...this.principleSelect, principle: principleName } as Principle;
      await firstValueFrom(this.administratorServices.putEvaluationStudent(payload));
      await this.getEvaluationStudent();
      this.hideDialogUpdate();
      this.showSuccess("Principio actualizado correctamente.");
    });
  }

  saveGuideline() {
    this.submitted = true;
    const guidelineName = normalizeTrimmedText(this.guideline.guideline);
    const principleId = this.principleSelect.id;

    if (!guidelineName) {
      this.showValidation("Ingrese la pauta de evaluacion.");
      return;
    }

    if (!principleId) {
      this.showRequestError(null, "Seleccione un principio antes de crear la pauta.");
      return;
    }

    void this.runAction("create-guideline", async () => {
      const payload = {
        ...this.guideline,
        guideline: guidelineName,
        principle: principleId,
      } as Guideline;

      await firstValueFrom(this.administratorServices.postGuidelineStudent(payload));
      this.hideDialog();
      await this.retrieveEvaluationData(principleId);
      this.showSuccess("Pauta creada correctamente.");
    });
  }

  saveUpdateGuideline() {
    this.submitted = true;
    const guidelineName = normalizeTrimmedText(this.guidelineSelect.guideline);

    if (!guidelineName) {
      this.showValidation("Ingrese la pauta de evaluacion.");
      return;
    }

    void this.runAction("update-guideline", async () => {
      const payload = {
        ...this.guidelineSelect,
        guideline: guidelineName,
      } as GuidelineUpdate;

      await firstValueFrom(this.administratorServices.updateGuidelineStudent(payload));
      this.guidelineSelect = payload;
      this.hideDialogUpdateGuideline();
      if (this.idSelectedPrinciple) {
        await this.retrieveEvaluationData(this.idSelectedPrinciple);
      }
      this.showSuccess("Pauta actualizada correctamente.");
    });
  }

  saveQuestion() {
    this.submitted = true;

    if (!this.isStudentQuestionValid(this.question)) {
      this.showValidation("Complete los campos obligatorios de la pregunta.");
      return;
    }

    if (!this.guidelineSelect.id) {
      this.showRequestError(null, "Seleccione una pauta antes de crear la pregunta.");
      return;
    }

    void this.runAction("create-question", async () => {
      const payload = this.normalizeStudentQuestion(this.question) as unknown as QuestionStudent;
      payload.guideline = this.guidelineSelect.id as number;

      await firstValueFrom(this.administratorServices.postQuestionStudent(payload));
      this.hideDialogquestion();
      await this.retrieveEvaluationData2(this.guidelineSelect.id as number);
      this.showSuccess("Pregunta creada correctamente.");
    });
  }

  saveUpdateQuestion() {
    this.submitted = true;

    if (!this.isStudentQuestionValid(this.questionSelect)) {
      this.showValidation("Complete los campos obligatorios de la pregunta.");
      return;
    }

    void this.runAction("update-question", async () => {
      const payload = this.normalizeStudentQuestion(
        this.questionSelect
      ) as unknown as QuestionStudentUpdate;

      const data = await firstValueFrom(
        this.administratorServices.updateQuestionStudent(payload)
      ) as unknown as RequestStatusResponse;
      const success = data?.message === undefined || data?.message === "success";
      if (!success) {
        this.showRequestError(null, "Error al actualizar el registro.");
        return;
      }

      this.questionSelect = payload;
      this.hideDialogUpdateQuestion();
      if (this.idSelectedGuideline) {
        await this.retrieveEvaluationData2(this.idSelectedGuideline);
      }
      this.showSuccess("Pregunta actualizada correctamente.");
    });
  }

  async getRetrieveGuideline(id: number) {
    try {
      const data = await firstValueFrom(
        this.administratorServices.retrieveEvaluationStudent(id)
      ) as StudentPrincipleDetailResponse;
      this.guidelineList = data?.guidelines || [];
      this.idSelectedPrinciple = id;
      this.refreshView();
    } catch (err: unknown) {
      this.showRequestError(err, "No se pudieron cargar las pautas.");
    }
  }

  async retrieveEvaluationData(id: number) {
    await this.getRetrieveGuideline(id);
  }

  async getRetrieveQuestion(id: number) {
    try {
      const data = await firstValueFrom(
        this.administratorServices.retrieveEvaluationStudentquestions(id)
      ) as StudentGuidelineDetailResponse;
      this.questionList = data?.questions || [];
      this.idSelectedGuideline = id;
      this.refreshView();
    } catch (err: unknown) {
      this.showRequestError(err, "No se pudieron cargar las preguntas.");
    }
  }

  async retrieveEvaluationData2(id: number) {
    await this.getRetrieveQuestion(id);
  }

  deleteEvaluationStudent(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target as EventTarget,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        void this.runAction("delete-principle", async () => {
          await firstValueFrom(this.administratorServices.deleteEvaluationStudent(id));
          await this.getEvaluationStudent();
          if (this.idSelectedPrinciple === id) {
            this.idSelectedPrinciple = null;
            this.idSelectedGuideline = null;
            this.guidelineList = [];
            this.questionList = [];
          }
          this.showSuccess("Eliminado correctamente.");
        });
      },
    });
  }

  deleteGuideline(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target as EventTarget,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        void this.runAction("delete-guideline", async () => {
          await firstValueFrom(this.administratorServices.deleteGuidelineStudent(id));
          if (this.idSelectedPrinciple) {
            await this.retrieveEvaluationData(this.idSelectedPrinciple);
          }
          if (this.idSelectedGuideline === id) {
            this.idSelectedGuideline = null;
            this.questionList = [];
          }
          this.showSuccess("Eliminado correctamente.");
        });
      },
    });
  }

  deleteQuestion(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target as EventTarget,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        void this.runAction("delete-question", async () => {
          await firstValueFrom(this.administratorServices.deleteQuestionStudent(id));
          if (this.idSelectedGuideline) {
            await this.retrieveEvaluationData2(this.idSelectedGuideline);
          }
          this.showSuccess("Eliminado correctamente.");
        });
      },
    });
  }

  isRequiredInvalid(value: unknown): boolean {
    return this.submitted && !hasTextValue(value);
  }

  private isStudentQuestionValid(
    question: Partial<QuestionStudent | QuestionStudentUpdate>
  ): boolean {
    return (
      hasTextValue(question.question) &&
      hasTextValue(question.metadata) &&
      hasTextValue(question.interpreter_st_yes) &&
      hasTextValue(question.interpreter_st_no) &&
      hasTextValue(question.interpreter_st_partially) &&
      hasTextValue(question.relevance) &&
      hasTextValue(question.weight) &&
      hasTextValue(question.description)
    );
  }

  private normalizeStudentQuestion(
    question: Partial<QuestionStudent | QuestionStudentUpdate>
  ) {
    return {
      ...question,
      question: normalizeTrimmedText(question.question),
      code: normalizeTrimmedText(question.code),
      metadata: normalizeTrimmedText(question.metadata),
      interpreter_st_yes: normalizeTrimmedText(question.interpreter_st_yes),
      interpreter_st_no: normalizeTrimmedText(question.interpreter_st_no),
      interpreter_st_partially: normalizeTrimmedText(question.interpreter_st_partially),
      relevance: normalizeTrimmedText(question.relevance),
      description: normalizeTrimmedText(question.description),
      weight: Number(question.weight ?? 0),
    };
  }

  private resetPrincipleForm() {
    this.principle = new Principle();
  }

  private resetGuidelineForm() {
    this.guideline = new Guideline();
  }

  private resetQuestionForm() {
    this.question = new QuestionStudent();
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
        action === "create-principle"
          ? "No se pudo crear el principio."
          : action === "update-principle"
            ? "No se pudo actualizar el principio."
            : action === "create-guideline"
              ? "No se pudo crear la pauta."
              : action === "update-guideline"
                ? "No se pudo actualizar la pauta."
                : action === "create-question"
                  ? "No se pudo crear la pregunta."
                  : action === "delete-principle"
                    ? "No se pudo eliminar el principio."
                    : action === "delete-guideline"
                      ? "No se pudo eliminar la pauta."
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
