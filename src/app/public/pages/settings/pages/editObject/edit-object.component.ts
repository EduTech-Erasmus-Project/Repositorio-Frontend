import { ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { firstValueFrom, forkJoin } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { Preference } from "../../../../../core/interfaces/Preference";
import { EducationLevel } from "../../../../../core/interfaces/EducationLevel";
import { KnowledgeArea } from "../../../../../core/interfaces/KnowledgeArea";
import { LearningObjectFile } from "../../../../../core/interfaces/LearningObjectFile";
import { SearchService } from "../../../../../services/search.service";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { focusFirstInvalidControl } from "src/app/core/utils/accessibility-focus";
import {
  DEFAULT_AGE_RANGE,
  OA_TITLE_MAX_LENGTH,
  OA_LANGUAGE_OPTIONS,
  REQUIRED_VALIDATORS,
  SelectOption,
  controlHasError,
  controlInvalid,
  formatAgeRange,
  getRangeLabel,
  mapCatalogOptions,
  parseAgeRange,
  resolveCatalogOptionValue,
} from "../../shared/settings-form.utils";

type EditObjectPayload = Record<string, unknown> & {
  id: number;
  educational_typicalAgeRange: string;
  avatar?: File | null;
};

@Component({
    selector: "app-edit-object",
    templateUrl: "./edit-object.component.html",
    styleUrls: ["./edit-object.component.scss"],
    standalone: false
})
/**
 * Gestiona la edicion del formulario principal de un OA ya cargado.
 *
 * El componente necesita coordinar dos fuentes async: el detalle puntual del OA
 * y los catalogos de seleccion. Solo cuando ambos bloques terminan de cargar se
 * libera la interfaz completa.
 */
export class EditObjectComponent implements OnInit {
  readonly titleMaxLength = OA_TITLE_MAX_LENGTH;

  @ViewChild("editObjectFormHost") editObjectFormHost?: ElementRef<HTMLElement>;

  private readonly destroyRef = inject(DestroyRef);

  public object: ObjectLearning;
  public file: File;
  public displayWindow = false;
  public objectForm!: FormGroup;
  public editData = false;
  public metadataDialogTriggerId = "edit-object-metadata-trigger";

  public preferencesData: Preference[];
  public educationLevels: EducationLevel[];
  public knowledgeArea: KnowledgeArea[];
  public licenses: SelectOption[];

  public loading = false;
  private catalogsLoaded = false;
  private objectLoaded = false;
  public currentFile: LearningObjectFile;
  public currentImg: string;

  public language = OA_LANGUAGE_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private objectService: LearningObjectService,
    private searchService: SearchService,
    private router: Router,
    private messageService: MessageService,
    private languageService: LanguageService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {
    void this.configureBreadcrumb();
  }

  ngOnInit(): void {
    this.loading = true;
    this.cdr.detectChanges();
    void this.loadData();
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: ParamMap) => {
        const objectId = Number(params.get("slug"));

        if (Number.isNaN(objectId)) {
          this.router.navigateByUrl("/settings/my-objects");
          return;
        }

        void this.getObjectDetail(objectId);
      });
  }

  /**
   * Publica el breadcrumb del flujo de edicion dentro del area privada.
   */
  private async configureBreadcrumb(): Promise<void> {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await firstValueFrom(this.languageService.translate.get("menu.settings")) },
      {
        label: await firstValueFrom(this.languageService.translate.get("menu.editOa")),
        routerLink: ["/settings/my-objects"],
      },
    ]);
  }

  /**
   * Recupera el OA a editar y arma el formulario con su snapshot actual.
   */
  async getObjectDetail(id: number): Promise<void> {
    try {
      const res = await firstValueFrom(this.objectService.getObjectDetailById(id));
      this.object = res;
      this.currentFile = res.learning_object_file;
      this.currentImg = res.avatar;
      this.loadForm();
      this.objectLoaded = true;
      this.updateLoadingState();
    } catch {
      this.router.navigateByUrl("/settings/my-objects");
    }
  }

  get previewUrl() {
    return this.currentFile?.url;
  }

  /**
   * Carga los catalogos auxiliares requeridos por el formulario de edicion.
   */
  async loadData(): Promise<void> {
    try {
      const {
        preferences,
        educationLevels,
        knowledgeArea,
        licenses,
      } = await firstValueFrom(
        forkJoin({
          preferences: this.searchService.getPreferences(),
          educationLevels: this.searchService.getLevelEducation(),
          knowledgeArea: this.searchService.getInterestAreas(),
          licenses: this.searchService.getLicenses(),
        })
      );

      this.preferencesData = mapCatalogOptions(preferences, "description") as Preference[];
      this.educationLevels = mapCatalogOptions(educationLevels.values, "name") as EducationLevel[];
      this.knowledgeArea = mapCatalogOptions(knowledgeArea.values, "name") as KnowledgeArea[];
      this.licenses = mapCatalogOptions(licenses.values, "description");
      this.catalogsLoaded = true;
    } finally {
      this.updateLoadingState();
    }
  }

  /**
   * Construye el formulario reactivo usando el estado actual del OA.
   */
  loadForm(): void {
    this.objectForm = this.fb.group({
      general_title: [
        this.object?.general_title || null,
        [...REQUIRED_VALIDATORS, Validators.maxLength(OA_TITLE_MAX_LENGTH)],
      ],
      general_description: [
        this.object?.general_description || null,
        REQUIRED_VALIDATORS,
      ],
      general_keyword: [
        this.object?.general_keyword || null,
        REQUIRED_VALIDATORS,
      ],
      education_levels: [
        resolveCatalogOptionValue(this.object?.education_levels),
        REQUIRED_VALIDATORS,
      ],
      general_language: [
        this.object?.general_language || null,
        REQUIRED_VALIDATORS,
      ],
      knowledge_area: [
        resolveCatalogOptionValue(this.object?.knowledge_area),
        REQUIRED_VALIDATORS,
      ],
      license: [resolveCatalogOptionValue(this.object?.license), REQUIRED_VALIDATORS],
      adaptation: [this.object?.adaptation || "yes", REQUIRED_VALIDATORS],
      educational_typicalAgeRange: [
        this.getRageAge(),
        [Validators.required, Validators.min(5), Validators.max(150)],
      ],
      avatar: [null],
    });
  }

  getRageAge(): [number, number] {
    return parseAgeRange(
      this.object?.educational_typicalAgeRange,
      DEFAULT_AGE_RANGE
    );
  }

  getErrorFormRequired(formValue: string): boolean {
    const control = this.objectForm.get(formValue);
    return controlHasError(control, "required") && controlInvalid(control);
  }

  getErrorFormMaxLength(formValue: string): boolean {
    const control = this.objectForm.get(formValue);
    return controlHasError(control, "maxlength") && controlInvalid(control);
  }

  getControlValueLength(formValue: string): number {
    const value = this.objectForm.get(formValue)?.value;
    return typeof value === "string" ? value.length : 0;
  }

  get currentAgeRangeLabel(): string {
    return getRangeLabel(this.objectForm?.controls?.educational_typicalAgeRange?.value);
  }

  /**
   * Persiste la edicion del OA y refleja en pantalla la nueva miniatura cargada.
   */
  async onSubmit(): Promise<void> {
    if (this.objectForm.valid) {
      this.editData = true;
      this.loading = true;
      this.cdr.detectChanges();

      const data: EditObjectPayload = {
        ...this.objectForm.getRawValue(),
        id: this.object.id,
      };

      data.educational_typicalAgeRange = formatAgeRange(
        this.objectForm.value.educational_typicalAgeRange
      );

      if (!this.objectForm.value.avatar) {
        delete data.avatar;
      }

      try {
        const res = await firstValueFrom(this.objectService.editMetadata(data));
        this.object = res;
        this.currentImg = res.avatar;
        this.messageService.add({
          severity: "success",
          summary: await firstValueFrom(this.languageService.translate.get("newObject.form.success")),
          detail: await firstValueFrom(this.languageService.translate.get("object.messageSuccess")),
        });
        this.file = null;
        this.loading = false;
        this.editData = false;
        this.cdr.detectChanges();
      } catch {
        this.messageService.add({
          severity: "error",
          summary: await firstValueFrom(this.languageService.translate.get("newObject.form.alert")),
          detail: await firstValueFrom(this.languageService.translate.get("object.messageError")),
        });
        this.loading = false;
        this.editData = false;
        this.cdr.detectChanges();
      }
      return;
    }

    this.markTouchForm();
    this.focusInvalidControl();
  }

  /**
   * Marca todos los controles para forzar la visualizacion de errores.
   */
  markTouchForm(): void {
    Object.values(this.objectForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  /**
   * Sincroniza la imagen seleccionada por el usuario con el formulario.
   */
  onSelectImage(event: { currentFiles?: File[] }): void {
    this.objectForm.patchValue({
      avatar: event.currentFiles?.[0] ?? null,
    });
  }

  /**
   * Abre el editor avanzado de metadatos.
   */
  openMetadataDialog(): void {
    this.displayWindow = true;
    this.cdr.detectChanges();
  }

  /**
   * Cierra el dialogo y devuelve el foco al disparador original.
   */
  restoreMetadataDialogFocus(): void {
    this.displayWindow = false;
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      document.getElementById(this.metadataDialogTriggerId)?.focus();
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  /**
   * Sincroniza el estado visible del dialogo hijo cuando este solicita cierre.
   */
  handleMetadataDialogVisibility(isVisible: boolean): void {
    this.displayWindow = isVisible;
    this.cdr.detectChanges();
  }

  /**
   * Recarga el detalle del OA cuando el editor de metadatos confirma cambios.
   */
  handleMetadataUpdate(shouldRefresh: boolean): void {
    if (shouldRefresh) {
      void this.getObjectDetail(this.object.id);
    }
  }

  private focusInvalidControl() {
    setTimeout(() => {
      focusFirstInvalidControl(
        this.editObjectFormHost?.nativeElement,
        ".slider .p-slider-handle"
      );
    }, 0);
  }

  private updateLoadingState(): void {
    this.loading = !(this.catalogsLoaded && this.objectLoaded);
    this.cdr.detectChanges();
  }
}
