import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { Concept, Metadata, MetadataUpdate } from "../../models/evaluation.models";
import {
  getRequestErrorMessage,
  hasTextValue,
  normalizeTrimmedText,
} from "../../shared/admin-form.utils";

interface AutomaticConceptDetailResponse {
  schemas?: Metadata[];
}

/**
 * Administra los conceptos y metadatos del esquema de evaluacion automatica.
 */
@Component({
  selector: "app-metadata-question-create-list",
  templateUrl: "./metadata-question-create-list.component.html",
  styleUrls: ["./metadata-question-create-list.component.scss"],
  providers: [MessageService, ConfirmationService],
  standalone: false,
})
export class MetadataQuestionCreateListComponent implements OnInit {
  conceptList: Concept[] = [];
  schemaList: Metadata[] = [];
  concept: Concept = new Concept();
  idSelectedConcept: number | null = null;
  conceptSelect: Concept = new Concept();
  schemaSelect: MetadataUpdate = new MetadataUpdate();
  schema: Metadata = new Metadata();

  schemaDialog = false;
  editConceptDialog = false;
  createConceptDialog = false;
  updateSchemaDialog = false;
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
        label: "Preguntas de evaluacion automatica",
        routerLink: ["/admin/expert/automatic"],
      },
    ]);
  }

  ngOnInit(): void {
    void this.getEvaluationAutomatic();
  }

  public get busy(): boolean {
    return this.actionLoading !== null;
  }

  public isActionLoading(action: string): boolean {
    return this.actionLoading === action;
  }

  async getEvaluationAutomatic() {
    try {
      this.conceptList =
        (await firstValueFrom(this.administratorServices.getEvaluationAutomatic())) || [];
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

  deleteEvaluationAutomatic(event: Event, id: number) {
    this.confirmDeleteAction(event, () => {
      void this.runAction("delete-concept", async () => {
        await firstValueFrom(this.administratorServices.deleteEvaluationAutomatic(id));
        await this.getEvaluationAutomatic();
        this.schemaList = [];
        if (this.idSelectedConcept === id) {
          this.idSelectedConcept = null;
        }
        this.showSuccess("Eliminado correctamente.");
      });
    });
  }

  hideDialogUpdate() {
    this.editConceptDialog = false;
    this.submitted = false;
  }

  hideDialogUpdateSchema() {
    this.updateSchemaDialog = false;
    this.submitted = false;
    this.schemaSelect = new MetadataUpdate();
  }

  hideDialog() {
    this.schemaDialog = false;
    this.submitted = false;
    this.resetSchemaForm();
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

  openEditSchemaDialog(schema: Metadata) {
    this.schemaSelect = {
      id: schema.id,
      schema: schema.schema,
      code: schema.code,
      description: schema.description,
      value_importance_schema: schema.value_importance_schema,
    };
    this.submitted = false;
    this.updateSchemaDialog = true;
  }

  updateConcept() {
    this.submitted = true;
    const conceptName = normalizeTrimmedText(this.conceptSelect?.concept);

    if (!conceptName) {
      this.showValidation("Ingrese el concepto de evaluacion.");
      return;
    }

    void this.runAction("update-concept", async () => {
      const payload = { ...this.conceptSelect, concept: conceptName } as Concept;
      await firstValueFrom(this.administratorServices.putEvaluationAutomatic(payload));
      this.conceptSelect = payload;
      this.editConceptDialog = false;
      this.submitted = false;
      await this.getEvaluationAutomatic();
      this.showSuccess("Concepto actualizado correctamente.");
    });
  }

  openSchema(concept: Concept) {
    this.conceptSelect = { ...concept };
    this.resetSchemaForm();
    this.submitted = false;
    this.schemaDialog = true;
  }

  isRequiredInvalid(value: unknown): boolean {
    return this.submitted && !hasTextValue(value);
  }

  private resetSchemaForm() {
    this.schema = new Metadata();
  }

  private isSchemaFormValid(schema: Partial<Metadata | MetadataUpdate>): boolean {
    return (
      hasTextValue(schema.schema) &&
      hasTextValue(schema.code) &&
      hasTextValue(schema.value_importance_schema) &&
      hasTextValue(schema.description)
    );
  }

  saveSchema() {
    this.submitted = true;

    if (!this.isSchemaFormValid(this.schema)) {
      this.showValidation("Complete los campos obligatorios del metadato.");
      return;
    }

    const conceptId = this.conceptSelect.id;
    if (!conceptId) {
      this.showRequestError(null, "Seleccione un concepto antes de crear el metadato.");
      return;
    }

    void this.runAction("create-schema", async () => {
      const payload = {
        ...this.normalizeSchemaPayload(this.schema),
        evaluation_concept: conceptId,
      } as unknown as Metadata;

      await firstValueFrom(this.administratorServices.postMetadataExpert(payload));
      await this.retrieveEvaluationData(conceptId);
      this.schemaDialog = false;
      this.resetSchemaForm();
      this.submitted = false;
      this.showSuccess("Metadato creado correctamente.");
    });
  }

  async getRetrieveSchema(id: number) {
    try {
      const data = await firstValueFrom(
        this.administratorServices.retrieveEvaluationAutomatic(id)
      ) as AutomaticConceptDetailResponse;
      this.schemaList = data?.schemas || [];
      this.idSelectedConcept = id;
      this.refreshView();
    } catch (err: unknown) {
      this.showRequestError(err, "No se pudieron cargar los metadatos.");
    }
  }

  async retrieveEvaluationData(id: number) {
    await this.getRetrieveSchema(id);
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
      await firstValueFrom(this.administratorServices.postEvaluationAutomatic(payload));
      await this.getEvaluationAutomatic();
      this.concept = new Concept();
      this.createConceptDialog = false;
      this.submitted = false;
      this.showSuccess("Concepto de evaluacion creado correctamente.");
    });
  }

  saveUpdateSchema() {
    this.submitted = true;

    if (!this.isSchemaFormValid(this.schemaSelect)) {
      this.showValidation("Complete los campos obligatorios del metadato.");
      return;
    }

    void this.runAction("update-schema", async () => {
      const payload = this.normalizeSchemaPayload(this.schemaSelect) as unknown as MetadataUpdate;
      await firstValueFrom(this.administratorServices.updateMetadataExpert(payload));
      this.schemaSelect = payload;
      this.updateSchemaDialog = false;
      this.submitted = false;
      if (this.idSelectedConcept) {
        await this.retrieveEvaluationData(this.idSelectedConcept);
      }
      this.showSuccess("Metadato actualizado correctamente.");
    });
  }

  deleteSchema(event: Event, id: number) {
    this.confirmDeleteAction(event, () => {
      void this.runAction("delete-schema", async () => {
        await firstValueFrom(this.administratorServices.deleteMetadataExpert(id));
        if (this.idSelectedConcept) {
          await this.retrieveEvaluationData(this.idSelectedConcept);
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

  private normalizeSchemaPayload(schema: Partial<Metadata | MetadataUpdate>) {
    return {
      ...schema,
      schema: normalizeTrimmedText(schema.schema),
      code: normalizeTrimmedText(schema.code),
      description: normalizeTrimmedText(schema.description),
      value_importance_schema: Number(schema.value_importance_schema ?? 0),
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
            : action === "create-schema"
              ? "No se pudo crear el metadato."
              : action === "delete-concept"
                ? "No se pudo eliminar el concepto."
                : action === "delete-schema"
                  ? "No se pudo eliminar el metadato."
                  : "No se pudo actualizar el metadato.";
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


