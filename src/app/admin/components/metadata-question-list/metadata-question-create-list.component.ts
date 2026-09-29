import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewRef } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { firstValueFrom } from "rxjs";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { Concept, Metadata, SelfQuestion } from "../../models/evaluation.models";
import {
  getRequestErrorMessage,
  hasTextValue,
  normalizeTrimmedText,
} from "../../shared/admin-form.utils";

interface MetadataQuestionRelationship {
  id_schema: number;
  id_question: number;
  id_concept: number;
}

interface MetadataQuestionRelationResponse {
  code?: number;
  ok?: boolean;
}

interface MetadataQuestionSchemaDetailResponse {
  schemas_questions?: Metadata[];
}

interface SelfQuestionDeleteResponse {
  code?: number;
}

/**
 * Administra las preguntas del esquema automatico y su relacion con
 * metadatos disponibles para cada concepto de evaluacion.
 */
@Component({
  selector: "app-metadata-question-create-list",
  templateUrl: "./metadata-question-create-list.component.html",
  styleUrls: ["./metadata-question-create-list.component.scss"],
  providers: [MessageService, ConfirmationService],
  standalone: false,
})
export class MetadataQuestionListComponent implements OnInit {
  selfQuestionList: SelfQuestion[] = [];
  schemaList: Metadata[] = [];
  selfQuestion: SelfQuestion = new SelfQuestion();
  selfQuestionSelect: SelfQuestion = new SelfQuestion();
  conceptEvaluation: Concept[] = [];
  metadataSchemas: Metadata[] = [];
  metadataSchemasFilter: Metadata[] = [];
  public descriptionMetadata = "";
  selectedQuestionId: number | null = null;
  submitted = false;
  actionLoading: string | null = null;

  public metadataSchemaQuestion: MetadataQuestionRelationship = {
    id_schema: 0,
    id_question: 0,
    id_concept: 0,
  };

  @ViewChild("dt") table!: Table;

  schemaDialog = false;
  editConceptDialog = false;
  createConceptDialog = false;

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
        label: "Preguntas de evaluacion automatica",
        routerLink: ["/admin/expert/automatic-question"],
      },
    ]);
  }

  ngOnInit(): void {
    void Promise.all([
      this.getEvaluationAutomaticQuestions(),
      this.getMetadataSchema(),
      this.getEvaluationConcept(),
    ]);
  }

  public get busy(): boolean {
    return this.actionLoading !== null;
  }

  public isActionLoading(action: string): boolean {
    return this.actionLoading === action;
  }

  private async getEvaluationConcept() {
    try {
      this.conceptEvaluation =
        (await firstValueFrom(this.administratorServices.getEvaluationAutomatic())) || [];
      this.refreshView();
    } catch {
      this.showRequestError(null, "No se pudo cargar los conceptos de evaluacion.");
    }
  }

  private async getEvaluationAutomaticQuestions() {
    try {
      this.selfQuestionList =
        (await firstValueFrom(this.administratorServices.getEvaluationAutomaticQuestion())) || [];
      this.refreshView();
    } catch {
      this.showRequestError(null, "No se pudieron cargar las preguntas de evaluacion.");
    }
  }

  private async getMetadataSchema() {
    try {
      this.metadataSchemas =
        (await firstValueFrom(
          this.administratorServices.getMetadataConceptQuestionsExpert()
        )) || [];
      this.refreshView();
    } catch {
      this.showRequestError(null, "No se pudo cargar los metadatos.");
    }
  }

  openNew() {
    this.resetQuestionForm();
    this.submitted = false;
    this.createConceptDialog = true;
  }

  hideDialogUpdate() {
    this.editConceptDialog = false;
    this.submitted = false;
  }

  hideDialog() {
    this.schemaDialog = false;
    this.submitted = false;
    this.resetMetadataRelationForm();
  }

  hideDialogConcept() {
    this.createConceptDialog = false;
    this.submitted = false;
    this.resetQuestionForm();
  }

  openEditConceptDialog(question: SelfQuestion) {
    this.selfQuestionSelect = { ...question };
    this.submitted = false;
    this.editConceptDialog = true;
  }

  updateConcept() {
    this.submitted = true;

    if (!this.isSelfQuestionFormValid(this.selfQuestionSelect)) {
      this.showValidation("Complete los campos obligatorios de la pregunta.");
      return;
    }

    void this.runAction("update-question", async () => {
      const payload = this.normalizeSelfQuestionPayload(
        this.selfQuestionSelect
      ) as SelfQuestion;
      await firstValueFrom(
        this.administratorServices.putEvaluationAutomaticQuestion(payload)
      );
      this.selfQuestionSelect = payload;
      this.editConceptDialog = false;
      this.submitted = false;
      await this.getEvaluationAutomaticQuestions();
      this.showSuccess("Pregunta actualizada correctamente.");
    });
  }

  openSchema(question: SelfQuestion) {
    this.selfQuestionSelect = { ...question };
    this.metadataSchemaQuestion.id_question = question.id as number;
    this.metadataSchemaQuestion.id_concept = Number(question.evaluation_concept);
    this.captureConceptId();
    this.captureDescriptionSchema();
    this.submitted = false;
    this.schemaDialog = true;
  }

  isRequiredInvalid(value: unknown): boolean {
    return this.submitted && !hasTextValue(value);
  }

  private resetQuestionForm() {
    this.selfQuestion = new SelfQuestion();
  }

  private resetMetadataRelationForm() {
    this.metadataSchemaQuestion = {
      id_schema: 0,
      id_question: 0,
      id_concept: 0,
    };
    this.descriptionMetadata = "";
    this.metadataSchemasFilter = [];
  }

  private isSelfQuestionFormValid(question: Partial<SelfQuestion>): boolean {
    return (
      hasTextValue(question.description) &&
      hasTextValue(question.descriptionEnglish) &&
      hasTextValue(question.evaluation_concept)
    );
  }

  saveSchema() {
    this.submitted = true;

    if (!hasTextValue(this.metadataSchemaQuestion.id_schema)) {
      this.showValidation("Seleccione un metadato para continuar.");
      return;
    }

    void this.runAction("save-relation", async () => {
      const schemaDetail = await firstValueFrom(
        this.administratorServices.putRelatioshipQuestionMetadata(
          this.metadataSchemaQuestion as unknown as Record<string, unknown>
        )
      ) as MetadataQuestionRelationResponse;
      const success =
        schemaDetail?.code === 200 || schemaDetail?.ok === true || !schemaDetail?.code;

      if (!success) {
        this.showRequestError(null, "Error al guardar los datos.");
        return;
      }

      const questionId = this.metadataSchemaQuestion.id_question;
      this.showSuccess("Se guardo la relacion con exito.");
      this.schemaDialog = false;
      this.resetMetadataRelationForm();
      if (questionId) {
        await this.retrieveEvaluationData(questionId);
      }
    });
  }

  async getRetrieveSchema(id: number) {
    const data = await firstValueFrom(
      this.administratorServices.retrieveEvaluationAutomaticQuestion(id)
    ) as MetadataQuestionSchemaDetailResponse;
    this.schemaList = data?.schemas_questions || [];
    this.selectedQuestionId = id;
    this.refreshView();
  }

  retrieveEvaluationData(id: number) {
    this.metadataSchemaQuestion.id_question = id;
    void this.getRetrieveSchema(id);
  }

  registerEvaluationData() {
    this.submitted = true;

    if (!this.isSelfQuestionFormValid(this.selfQuestion)) {
      this.showValidation("Complete los campos obligatorios de la pregunta.");
      return;
    }

    void this.runAction("create-question", async () => {
      const payload = this.normalizeSelfQuestionPayload(this.selfQuestion) as SelfQuestion;
      await firstValueFrom(
        this.administratorServices.postEvaluationAutomaticQuestion(payload)
      );
      await this.getEvaluationAutomaticQuestions();
      this.createConceptDialog = false;
      this.submitted = false;
      this.resetQuestionForm();
      this.showSuccess("Pregunta creada correctamente.");
    });
  }

  deleteSchema(event: Event, id: number) {
    this.metadataSchemaQuestion.id_schema = id;
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target as EventTarget,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.deleteRegister();
      },
    });
  }

  private deleteRegister() {
    void this.runAction("delete-relation", async () => {
      await firstValueFrom(
        this.administratorServices.deleteRelatioshipQuestionMetadata(this.metadataSchemaQuestion)
      );
      this.showSuccess("Eliminado correctamente.");
      if (this.metadataSchemaQuestion.id_question) {
        await this.getRetrieveSchema(this.metadataSchemaQuestion.id_question);
      }
    });
  }

  public captureDescriptionSchema() {
    const selectedSchema = this.metadataSchemas.find(
      (item) => item.id === this.metadataSchemaQuestion.id_schema
    );
    this.descriptionMetadata = selectedSchema?.description || "";
  }

  public captureConceptId() {
    this.metadataSchemasFilter = this.metadataSchemas.filter(
      (item) => item.evaluation_concept == this.metadataSchemaQuestion.id_concept
    );
  }

  public deleteSelfQuestion(event: Event, idSelfQuestion: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target as EventTarget,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        void this.runAction("delete-question", async () => {
          const res = await firstValueFrom(
            this.administratorServices.deleteSelfQuestion(idSelfQuestion)
          ) as SelfQuestionDeleteResponse;

          if (res?.code !== undefined && res.code !== 200) {
            this.showRequestError(null, "Error al eliminar el registro.");
            return;
          }

          this.showSuccess("Se elimino el registro exitosamente.");
          await this.getEvaluationAutomaticQuestions();
          if (this.selectedQuestionId === idSelfQuestion) {
            this.schemaList = [];
            this.selectedQuestionId = null;
          }
        });
      },
    });
  }

  private normalizeSelfQuestionPayload(question: Partial<SelfQuestion>) {
    return {
      ...question,
      description: normalizeTrimmedText(question.description),
      descriptionEnglish: normalizeTrimmedText(question.descriptionEnglish),
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
        action === "create-question"
          ? "No se pudo crear la pregunta."
          : action === "update-question"
            ? "No se pudo actualizar la pregunta."
            : action === "delete-relation"
              ? "Error al eliminar la relacion."
              : action === "delete-question"
                ? "Error al eliminar el registro."
                : "Error al guardar los datos.";
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
