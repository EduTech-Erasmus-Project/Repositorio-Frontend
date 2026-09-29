import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { MessageService } from "primeng/api";
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { LanguageService } from "src/app/services/language.service";

type MetadataFieldKey =
  | "general_catalog"
  | "general_coverage"
  | "general_entry"
  | "general_keyword"
  | "general_language"
  | "general_structure"
  | "life_cycle_role"
  | "life_cycle_version"
  | "meta_metadata_catalog"
  | "meta_metadata_description"
  | "meta_metadata_dateTime"
  | "technical_description"
  | "technical_format"
  | "technical_installationRremarks"
  | "technical_location"
  | "educational_description"
  | "educational_difficulty"
  | "educational_language"
  | "educational_learningResourceType"
  | "educational_procces_cognitve"
  | "educational_typicalLearningTime_description"
  | "rights_copyrightAndOtherRestrictions"
  | "annotation_date_description"
  | "annotation_date_dateTime"
  | "annotation_description"
  | "annotation_entity"
  | "annotation_modeaccess"
  | "annotation_modeaccesssufficient"
  | "relation_catalog"
  | "relation_description"
  | "relation_kind"
  | "relation_entry"
  | "classification_description"
  | "classification_keyword"
  | "classification_purpose"
  | "classification_taxonPath_source"
  | "classification_taxonPath_taxon"
  | "accesibility_summary"
  | "accesibility_features"
  | "accesibility_hazard"
  | "accesibility_control"
  | "accesibility_api"
  | "rights_cost"
  | "annotation_rol";

type MetadataFormControls = {
  [K in MetadataFieldKey]: FormControl<unknown>;
};

const METADATA_FIELD_KEYS: MetadataFieldKey[] = [
  "general_catalog",
  "general_coverage",
  "general_entry",
  "general_keyword",
  "general_language",
  "general_structure",
  "life_cycle_role",
  "life_cycle_version",
  "meta_metadata_catalog",
  "meta_metadata_description",
  "meta_metadata_dateTime",
  "technical_description",
  "technical_format",
  "technical_installationRremarks",
  "technical_location",
  "educational_description",
  "educational_difficulty",
  "educational_language",
  "educational_learningResourceType",
  "educational_procces_cognitve",
  "educational_typicalLearningTime_description",
  "rights_copyrightAndOtherRestrictions",
  "annotation_date_description",
  "annotation_date_dateTime",
  "annotation_description",
  "annotation_entity",
  "annotation_modeaccess",
  "annotation_modeaccesssufficient",
  "relation_catalog",
  "relation_description",
  "relation_kind",
  "relation_entry",
  "classification_description",
  "classification_keyword",
  "classification_purpose",
  "classification_taxonPath_source",
  "classification_taxonPath_taxon",
  "accesibility_summary",
  "accesibility_features",
  "accesibility_hazard",
  "accesibility_control",
  "accesibility_api",
  "rights_cost",
  "annotation_rol",
];

type MetadataEditPayload = Partial<Record<MetadataFieldKey, unknown>> & {
  id: number;
};

@Component({
    selector: "app-edit-metadata",
    templateUrl: "./edit-metadata.component.html",
    styleUrls: ["./edit-metadata.component.scss"],
    standalone: false
})
/**
 * Edita el bloque extendido de metadatos de un OA ya existente.
 *
 * Este componente se usa dentro del dialogo de `editObject` y trabaja sobre una
 * copia reactiva de los campos editables para evitar mutar el objeto original
 * hasta que el backend confirme la actualizacion.
 */
export class EditMetadataComponent implements OnInit {
  @Input({ required: true }) object!: ObjectLearning;
  @Output("clouceEvent") closeEvent = new EventEmitter<boolean>();
  @Output("updateEvent") metadataUpdated = new EventEmitter<boolean>();

  public metadataForm!: FormGroup<MetadataFormControls>;
  public saving = false;

  constructor(
    private fb: FormBuilder,
    private objectService: LearningObjectService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  /**
   * Construye el formulario tomando como base el snapshot actual del OA.
   */
  buildForm(): void {
    const controls = METADATA_FIELD_KEYS.reduce((acc, key) => {
      acc[key] = this.fb.control(this.object?.[key] ?? null);
      return acc;
    }, {} as MetadataFormControls);

    this.metadataForm = this.fb.group(controls);
    this.cdr.detectChanges();
  }

  /**
   * Persiste los metadatos editados y notifica al padre para que recargue el OA.
   */
  async submitMetadataUpdate(): Promise<void> {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();
    const data: MetadataEditPayload = {
      ...this.metadataForm.getRawValue(),
      id: this.object.id,
    };

    try {
      await firstValueFrom(this.objectService.editMetadata(data));
      this.metadataUpdated.emit(true);

      this.messageService.add({
        severity: "success",
        summary: await firstValueFrom(this.languageService.translate.get("newObject.form.success")),
        detail: await firstValueFrom(this.languageService.translate.get("object.messageSuccess")),
      });
      this.closeWindow();
      this.cdr.detectChanges();
    } catch (err) {
      this.messageService.add({
        severity: "error",
        summary: await firstValueFrom(this.languageService.translate.get("newObject.form.alert")),
        detail: await firstValueFrom(this.languageService.translate.get("object.messageError")),
      });
      this.cdr.detectChanges();
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Solicita al componente padre cerrar el dialogo actual.
   */
  closeWindow(): void {
    this.closeEvent.emit(false);
  }
}
