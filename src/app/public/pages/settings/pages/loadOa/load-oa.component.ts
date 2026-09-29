import { ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from "@angular/core";
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from "@angular/forms";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { ConvertLearningObject } from "../../../../../core/models/ConvertLearningObject";
import { firstValueFrom, forkJoin, Observable } from "rxjs";
import { SearchService } from "../../../../../services/search.service";
import { Preference } from "../../../../../core/interfaces/Preference";
import { EducationLevel } from "../../../../../core/interfaces/EducationLevel";
import { KnowledgeArea } from "../../../../../core/interfaces/KnowledgeArea";
import { License } from "../../../../../core/interfaces/License";
import { MessageService } from "primeng/api";
import { LanguageService } from "../../../../../services/language.service";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { PathsImgPreview, TagOA } from "src/app/core/interfaces/TagOA";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdministratorService } from "src/app/services/administrator.service";
import { FileUpload } from "primeng/fileupload";
import { SelfQuestion } from "src/app/admin/models/evaluation.models";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
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
import { focusFirstInvalidControl } from "src/app/core/utils/accessibility-focus";
import { formatFileSize } from "src/app/core/utils/file.utils";
import { safeJsonParse } from "src/app/core/utils/json.utils";
import { translateInstant } from "src/app/core/utils/i18n.utils";
import { openTrustedExternalUrl } from "src/app/core/utils/external-navigation.utils";

type UploadDiagnostics = {
  scorm?: boolean;
  media?: boolean;
  web?: boolean;
  is_exelearning?: boolean;
};

type UploadResponseBody = {
  data: UploadDiagnostics;
  metadata: string;
  tag_count: TagOA;
  oa_file: {
    id: number;
    url: string;
  };
};

type UploadEventPayload = {
  files?: File[];
  currentFiles?: File[];
  originalEvent: {
    body: UploadResponseBody;
  };
};

type LearningObjectQuestionAnswer = {
  idQuestion: number;
  answer: string;
};

type CoverSelectionSource = "auto" | "suggested" | "manual" | null;

@Component({
    selector: "app-load-oa",
    templateUrl: "./load-oa.component.html",
    styleUrls: ["./load-oa.component.scss"],
    standalone: false
})
/**
 * Orquesta la carga inicial de un OA nuevo dentro del area privada.
 *
 * El flujo tiene dos etapas: primero subir y analizar el archivo fuente, y
 * despues completar o corregir los metadatos antes del guardado final.
 */
export class LoadOaComponent implements OnInit {
  readonly titleMaxLength = OA_TITLE_MAX_LENGTH;

  @ViewChild("mainUpload") mainUpload?: FileUpload;
  @ViewChild("sourceUpload") sourceUpload?: FileUpload;
  @ViewChild("imageUpload") imageUpload?: FileUpload;
  @ViewChild("loadOaFormHost") loadOaFormHost?: ElementRef<HTMLElement>;
  @ViewChild("previewActionButtonHost") previewActionButtonHost?: ElementRef<HTMLElement>;
  @ViewChild("metadataActionButtonHost") metadataActionButtonHost?: ElementRef<HTMLElement>;
  public translate: TranslateService;
  public baseUrl: string;
  public objectUrl: string | null = null;
  public object: ObjectLearning | null = null;
  public readonly formatFileSize = formatFileSize;
  public file: File | null = null;
  public selectedArchiveFile: File | null = null;
  public metaData: UploadResponseBody | null = null;
  public displayWindow: boolean;
  public objectForm!: FormGroup;
  private readonly destroyRef = inject(DestroyRef);
  public tag_count: TagOA | null = null;
  public preferencesData: Preference[] = [];
  public educationLevels: EducationLevel[] = [];
  public knowledgeArea: KnowledgeArea[] = [];
  public licenses: SelectOption[] = [];
  public img_preview_ref: boolean = false;
  public path_img_preview: string | null = null;
  public loading: boolean = false;
  public paths_img_preview: PathsImgPreview[] = [];
  public questionsEvaluationSchema: SelfQuestion[] = [];
  private messages = {
    successFile: "",
    errorFile: "",
    successMetadata: "",
    errorMetadata: "",
  };
  public spinner: boolean = false;
  public first: number = 0;
  public language = OA_LANGUAGE_OPTIONS;

  public isErrorUpload: boolean = false;
  public messagesError: boolean = false;

  public activateDisplayMedia: boolean = false;
  public activateDisplaySCORM: boolean = false;
  public activateDisplayWEBSTE: boolean = false;
  public activateDisplayIsExelearning: boolean = false;
  public viewInfoOA: boolean = false;
  public coverSelectionSource: CoverSelectionSource = null;
  public selectedCoverFileName: string | null = null;
  constructor(
    private fb: FormBuilder,
    private learningObjectService: LearningObjectService,
    private searchService: SearchService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private h: HttpClient,
    private sanitizer: DomSanitizer,
    private breadcrumbService: BreadcrumbService,
    private administrationService: AdministratorService,
    private cdr: ChangeDetectorRef
  ) {
    void this.configureBreadcrumb();
  }

  ngOnInit(): void {
    this.baseUrl = this.learningObjectService.urlUpload;
    this.translate = this.languageService.translate;
    this.messages = this.translate.translations?.newObject?.messages || this.messages;
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((translate: LangChangeEvent) => {
        this.messages = translate.translations.newObject.messages;
        this.cdr.detectChanges();
      });
    void this.initializeCatalogs();
  }

  /**
   * Publica el breadcrumb del flujo de carga de OA.
   */
  private async configureBreadcrumb(): Promise<void> {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: await this.getTranslation("menu.settings"),
      },
      {
        label: await this.getTranslation("menu.sideMenu.uploadOA"),
        routerLink: ["/settings/new-object"],
      },
    ]);
  }

  private async getTranslation(key: string): Promise<string> {
    return firstValueFrom(this.languageService.translate.get(key));
  }

  /**
   * Rehidrata catalogos auxiliares antes de que el usuario complete el formulario.
   */
  private async initializeCatalogs(): Promise<void> {
    await this.loadData();
    this.cdr.detectChanges();
  }

  /**
   * Carga catalogos requeridos por el formulario principal del OA.
   */
  async loadData(): Promise<void> {
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
  }

  /**
   * Construye el formulario base a partir del metadata extraido del archivo.
   */
  loadForm(): void {
    this.objectForm = this.fb.group({
      title: [
        this.object?.general_title || null,
        [...REQUIRED_VALIDATORS, Validators.maxLength(OA_TITLE_MAX_LENGTH)],
      ],
      description: [
        this.object?.general_description || null,
        REQUIRED_VALIDATORS,
      ],
      keywords: [this.object?.general_keyword || null, REQUIRED_VALIDATORS],
      adaptations: ["no", REQUIRED_VALIDATORS],
      img: [null, REQUIRED_VALIDATORS],
      sourceFile: [null],
      language: [resolveCatalogOptionValue(this.object?.general_language), REQUIRED_VALIDATORS],
      age: [this.getRageAge(), [Validators.required]],
      education_levels: [resolveCatalogOptionValue(this.object?.education_levels), REQUIRED_VALIDATORS],
      knowledge_area: [resolveCatalogOptionValue(this.object?.knowledge_area), REQUIRED_VALIDATORS],
      license: [resolveCatalogOptionValue(this.object?.license), REQUIRED_VALIDATORS],
      is_adapted_oer: [false],
    });
  }

  getRageAge(): [number, number] {
    return parseAgeRange(this.object?.educational_typicalAgeRange, DEFAULT_AGE_RANGE);
  }

  /**
   * Procesa la respuesta del analizador del OA y habilita la segunda etapa del flujo.
   */
  async onUpload(evt: UploadEventPayload): Promise<void> {
    this.spinner = false;
    this.isErrorUpload = false;
    this.cdr.detectChanges();

    this.syncUploadDisplayFlags(evt.originalEvent.body.data);
    this.isErrorUpload = true;

    const lom = safeJsonParse<Record<string, unknown>>(
      evt.originalEvent.body.metadata,
      {}
    );
    this.tag_count = evt.originalEvent.body.tag_count;
    this.metaData = evt.originalEvent.body;
    this.file = evt.files?.[0] ?? evt.currentFiles?.[0] ?? this.selectedArchiveFile;
    this.selectedArchiveFile = null;
    this.objectUrl = evt.originalEvent.body.oa_file.url;
    this.object = this.buildLoadedObject(lom);
    this.messageService.add({
      severity: "success",
      summary: await this.getTranslation("newObject.form.success"),
      detail: await this.getTranslation("newObject.form.successUploadFile"),
    });
    this.loadForm();
    if (this.tag_count.is_adapted_oer != true) {
      await this.getQuestionsEvaluation();
    }
    this.fill_in_the_answers_automatically_adpated_is_adapted(this.tag_count);
    this.cdr.detectChanges();
    this.focusPreviewAction();
  }

  progress_event(evt: unknown): void {
    this.spinner = true;
    this.cdr.detectChanges();
  }

  onMainFileSelect(event: { currentFiles?: File[]; files?: File[] } | null | undefined): void {
    this.selectedArchiveFile =
      event?.currentFiles?.[0] ?? event?.files?.[0] ?? null;
    this.isErrorUpload = false;
    this.cdr.detectChanges();
  }

  clearSelectedArchiveFile(): void {
    this.selectedArchiveFile = null;
    if (!this.object) {
      this.file = null;
    }
    this.isErrorUpload = false;
    this.cdr.detectChanges();
  }

  removeSelectedArchiveFile(): void {
    this.mainUpload?.clear();
    this.clearSelectedArchiveFile();
  }

  onError(evt: {
    error?: {
      error?: { data?: UploadDiagnostics; message?: string };
      message?: string;
    };
    message?: string;
  }): void {
    this.spinner = false;
    this.syncUploadDisplayFlags(evt.error?.error?.data);
    this.isErrorUpload = true;
    const message: string = evt.error?.error?.message || evt.error?.message || evt.message || "";
    this.messageService.add({
      severity: "error",
      summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
      detail: message,
    });
    this.cdr.detectChanges();
  }

  /**
   * Ajusta el formulario segun las banderas detectadas automaticamente por backend.
   */
  private fill_in_the_answers_automatically_adpated_is_adapted(object_tag_oa: TagOA): void {
    this.isErrorUpload = true;
    const is_adapted = object_tag_oa.is_adapted_oer;

    if (is_adapted === true) {
      this.objectForm.controls["is_adapted_oer"].setValue(true);
      this.objectForm.controls["adaptations"].setValue("yes");
      this.objectForm.controls["adaptations"].disable();
    }

    const imagePreview = object_tag_oa.img_prev ?? object_tag_oa.im_prev;
    const is_img_preview = Boolean(imagePreview?.exist ?? imagePreview?.exists);
    if (is_img_preview) {
      this.img_preview_ref = true;
      this.path_img_preview = imagePreview?.url_img ?? null;
      const name_img = imagePreview?.name ?? "img-prev.png";
      this.load_img_preview_form(this.path_img_preview, name_img, "auto");
    } else {
      this.img_preview_ref = false;
    }

    if (Array.isArray(object_tag_oa.paths_img_preview)) {
      this.paths_img_preview = object_tag_oa.paths_img_preview;
      const array_aux_paths = [];
      this.paths_img_preview.forEach((value, index) => {
        if (index < 6) {
          array_aux_paths.push(value);
        }
      });
      this.paths_img_preview = array_aux_paths;
    }
  }

  /**
   * Funcion para cargar las preguntas a evaluar
   * @method getQuestionsEvaluation
   */
  private async getQuestionsEvaluation() {
    const questionEval: SelfQuestion[] = await firstValueFrom(
      this.administrationService.getEvaluationAutomaticQuestion()
    );
    if (questionEval.length > 0) {
      this.questionsEvaluationSchema = questionEval;
      this.questionsEvaluationSchema.forEach((element) => {
        const controlName = "item" + element.id.toString();

        if (!this.objectForm.contains(controlName)) {
          this.objectForm.addControl(
            controlName,
            new FormControl(null, { validators: [Validators.required] })
          );
        }
      });
    }
  }

  private load_img_preview_form(
    urlImg: string,
    fileName: string,
    source: Exclude<CoverSelectionSource, null>
  ): void {
    void this.patchPreviewImage(urlImg, fileName, source);
  }

  private loadImage_blob(url: string): Observable<Blob> {
    return this.h.get(url, {
      responseType: "blob",
    });
  }

  private async patchPreviewImage(
    urlImg: string,
    fileName: string,
    source: Exclude<CoverSelectionSource, null>
  ): Promise<void> {
    const image = await firstValueFrom(this.loadImage_blob(urlImg));
    const imageURL: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(
      URL.createObjectURL(image)
    );
    const file = new File([image], fileName, { type: "image/png" }) as File & {
      objectURL?: SafeUrl;
    };
    file.objectURL = imageURL;
    this.objectForm.patchValue({
      img: file,
    });
    this.coverSelectionSource = source;
    this.selectedCoverFileName = fileName;
    this.cdr.detectChanges();
  }

  async onSubmit() {
    if (this.loading || !this.objectForm) {
      return;
    }

    this.objectForm.markAllAsTouched();
    this.objectForm.updateValueAndValidity();
    if (!this.objectForm.valid) {
      this.loading = false;
      this.cdr.detectChanges();
      this.focusFirstInvalidControl();
      this.messageService.add({
        severity: "error",
        summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
        detail: await this.getTranslation("newObject.form.invalidForm"),
      });
      return;
    }

    const object_adaptations = this.objectForm.getRawValue();
    this.loading = true;
    this.cdr.detectChanges();
    this.applyFormValuesToObject(object_adaptations);

    try {
      if (this.tag_count.is_adapted_oer !== true) {
        await this.saveAutomaticEvaluation(this.object.learning_object_file?.id);
      }

      await firstValueFrom(
        this.learningObjectService.addMetadata({
          ...this.object,
          learning_object_file: this.object.learning_object_file?.id,
        })
      );

      await this.formatVariables();
    } catch (err) {
      await this.captureImageError(err);
    }
  }

  /**
   * Registra la evaluacion preliminar usando el identificador del archivo fuente.
   *
   * Este guardado debe ocurrir antes de persistir la metadata final del OA,
   * porque el backend actual arma el resumen preliminar a partir de esa
   * relacion temprana con `learning_object_file.id`.
   */
  private async saveAutomaticEvaluation(learningObjectFileId?: number): Promise<void> {
    if (!learningObjectFileId) {
      throw new Error("Missing learning object file id for automatic evaluation");
    }

    await firstValueFrom(
      this.learningObjectService.addQuestionQualificationLearningObject({
        answerQuestion: this.createOfQuestionsArray(),
        learning_object_id: learningObjectFileId,
      })
    );
  }

  /**
   * Traduce el estado actual del formulario al contrato esperado por el servicio.
   */
  private applyFormValuesToObject(objectAdaptations: Record<string, unknown>): void {
    if (!this.object || !this.metaData) {
      return;
    }

    this.object.learning_object_file = { id: this.metaData.oa_file.id };
    this.object.adaptation = (objectAdaptations.adaptations as string | undefined) ?? "";
    this.object.general_title = (objectAdaptations.title as string | undefined) ?? "";
    this.object.general_description = (objectAdaptations.description as string | undefined) ?? "";
    this.object.general_keyword = (objectAdaptations.keywords as string | undefined) ?? "";
    this.object.general_language = (objectAdaptations.language as string | undefined) ?? "";
    this.object.educational_typicalAgeRange = formatAgeRange(objectAdaptations.age as [number, number]);
    this.object.education_levels = (objectAdaptations.education_levels as EducationLevel[] | undefined) ?? [];
    this.object.knowledge_area = (objectAdaptations.knowledge_area as KnowledgeArea | null | undefined) ?? null;
    this.object.license = (objectAdaptations.license as License | null | undefined) ?? null;
    (this.object as unknown as Record<string, unknown>).avatar = objectAdaptations.img ?? null;
    (this.object as unknown as Record<string, unknown>).source_file = objectAdaptations.sourceFile ?? null;
    this.object.is_adapted_oer = Boolean(objectAdaptations.is_adapted_oer);
  }

  /**
   * funcion para formatear la variables
   * luego de enviar los datos del objeto de aprendizaje
   * @method formatVariables
   */
  private async formatVariables() {
    this.messageService.add({
      severity: "success",
      summary: translateInstant(this.languageService.translate, "message.titleSuccess", "Success"),
      detail: await this.getTranslation("newObject.form.fileSendReview"),
    });
    this.resetLoadedState();
    this.cdr.detectChanges();
  }

  private focusPreviewAction() {
    setTimeout(() => {
      const previewButton = this.previewActionButtonHost?.nativeElement.querySelector("button");
      previewButton?.focus();
    }, 0);
  }

  private focusMetadataAction() {
    setTimeout(() => {
      const metadataButton = this.metadataActionButtonHost?.nativeElement.querySelector("button");
      metadataButton?.focus();
    }, 0);
  }

  /**
   * Funcion para ejecutar el error cuando existen problemas
   * en las imagenes
   * @method captureImageError
   */
  private async captureImageError(err: unknown): Promise<void> {
    const error = err as HttpErrorResponse & {
      error?: {
        avatar?: string[];
      };
    };

    if (Array.isArray(error.error?.avatar) && error.error.avatar.length > 0) {
      this.img_preview_ref = false;
      this.objectForm.controls["img"].setValue(null);
      this.coverSelectionSource = null;
      this.selectedCoverFileName = null;
      this.objectForm.markAllAsTouched();
      this.objectForm.updateValueAndValidity();
      this.loading = false;
      this.messagesError = true;
      this.cdr.detectChanges();
      this.messageService.add({
        severity: "error",
        summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
        detail: await this.getTranslation("newObject.infoErrorImage"),
      });
    } else {
      this.messageService.add({
        severity: "error",
        summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
        detail: await this.getTranslation("newObject.form.errorSaveData"),
      });
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Funcion para crear el array de las respuestas a las preguntas creadas
   * por el administrador
   * @method createOfQuestionsArray
   * @returns
   */
  private createOfQuestionsArray(): LearningObjectQuestionAnswer[] {
    const arrayResponse: LearningObjectQuestionAnswer[] = [];
  
    this.questionsEvaluationSchema.forEach((element) => {
      const data = {
        idQuestion: element.id,
        answer: String(this.objectForm.get("item" + element.id)?.value ?? ""),
      };
      arrayResponse.push(data);
    });
    return arrayResponse;
  }

  getQuestionDescription(question: SelfQuestion): string {
    const currentLang = this.languageService.translate.currentLang || "es";
    const isEnglish = currentLang.toLowerCase().startsWith("en");

    if (isEnglish) {
      return question.descriptionEnglish || question.description || "";
    }

    return question.description || question.descriptionEnglish || "";
  }

  // private set_salidators_form_controls(name_control: string) {
  //   this.objectForm.controls[name_control].setValidators([Validators.required]);
  //   this.objectForm.get(name_control).updateValueAndValidity();
  // }

  markTouchForm(): void {
    Object.values(this.objectForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  onSelectImage(event: { currentFiles?: File[] }): void {
    const image = (event.currentFiles?.[0] ?? null) as (File & { objectURL?: SafeUrl }) | null;
    if (image && !image.objectURL) {
      image.objectURL = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image));
    }
    this.objectForm.patchValue({
      img: image,
    });
    this.coverSelectionSource = image ? "manual" : null;
    this.selectedCoverFileName = image?.name ?? null;
    this.messagesError = false;
    this.cdr.detectChanges();
  }

  /**
   * Lleva el foco al primer control invalido para mejorar el flujo accesible.
   */
  private focusFirstInvalidControl(): void {
    setTimeout(() => {
      focusFirstInvalidControl(
        this.loadOaFormHost?.nativeElement,
        this.objectForm?.get("age")?.invalid ? ".slider .p-slider-handle" : null
      );
    }, 0);
  }

  clearSelectedImage(): void {
    this.objectForm.patchValue({
      img: null,
    });
    this.coverSelectionSource = null;
    this.selectedCoverFileName = null;
    this.messagesError = false;
    this.cdr.detectChanges();
  }

  onSelectFile(event: { currentFiles?: File[] }): void {
    this.objectForm.patchValue({
      sourceFile: event.currentFiles?.[0] ?? null,
    });
  }

  clearSelectedSourceFile(): void {
    this.objectForm.patchValue({
      sourceFile: null,
    });
    this.cdr.detectChanges();
  }

  handleFormEnterKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target || event.defaultPrevented || event.isComposing) {
      return;
    }

    if (this.allowEnterKey(target)) {
      return;
    }

    event.preventDefault();
  }

  private allowEnterKey(target: HTMLElement): boolean {
    return Boolean(
      target.closest("textarea") ||
        target.closest("select") ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest(".p-select")
    );
  }

  /**
   * Abre la vista de metadata generada para revision rapida del usuario.
   */
  showBasicDialog2(): void {
    this.displayWindow = true;
    this.cdr.detectChanges();
  }

  onMetadataDialogHide(): void {
    this.displayWindow = false;
    this.cdr.detectChanges();
    this.focusMetadataAction();
  }

  cancelLoadOa(): void {
    this.resetLoadedState();
  }

  navigate(): void {
    if (!openTrustedExternalUrl(this.objectUrl)) {
      this.messageService.add({
        severity: "error",
        summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
        detail: translateInstant(
          this.languageService.translate,
          "object.invalidExternalUrl",
          "La URL del recurso no es valida o no esta permitida."
        ),
      });
    }
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

  getControlDescribedBy(controlName: string, helperIds: string[] = [], errorIds: string[] = []): string | null {
    const ids = [
      ...helperIds,
      ...(this.getErrorFormRequired(controlName) || this.getErrorFormMaxLength(controlName) ? errorIds : []),
    ].filter(Boolean);

    return ids.length ? ids.join(" ") : null;
  }

  getImageUploadDescribedBy(): string {
    const ids = ["image-upload-help"];

    if (this.getErrorFormRequired("img")) {
      ids.push("image-required-error");
    }

    if (this.messagesError) {
      ids.push("image-error");
    }

    return ids.join(" ");
  }

  get currentAgeRangeLabel(): string {
    return getRangeLabel(this.objectForm?.controls?.age?.value);
  }

  get is_adapted_oer() {
    return this.objectForm.get("is_adapted_oer").value;
  }

  onPageChange(event: { first: number }): void {
    this.first = event.first;
    this.cdr.detectChanges();
  }

  refresh(): void {
    this.first = 0;
    this.cdr.detectChanges();
  }
  get image() {
    const array = this.paths_img_preview[this.first];
    return array;
  }

  get totalRecords() {
    return this.paths_img_preview.length;
  }

  get hasSelectedCoverImage(): boolean {
    return Boolean(this.objectForm?.get("img")?.value);
  }

  get selectedCoverPreviewUrl(): SafeUrl | string | null {
    const image = this.objectForm?.get("img")?.value as (File & { objectURL?: SafeUrl }) | null | undefined;
    return image?.objectURL ?? null;
  }

  get showSuggestedCoverGallery(): boolean {
    return !this.img_preview_ref && this.paths_img_preview.length > 0 && this.coverSelectionSource !== "suggested";
  }

  get uploadInfoAccordionValue(): string | null {
    if (this.activateDisplayMedia) {
      return "media";
    }

    if (this.activateDisplaySCORM) {
      return "scorm";
    }

    if (this.activateDisplayWEBSTE) {
      return "website";
    }

    return null;
  }

  public async img_preview_save(url_img: string): Promise<void> {
    this.messageService.add({
      severity: "success",
      summary: await this.getTranslation("newObject.form.success"),
      detail: await this.getTranslation("newObject.form.alertSuccessSelect"),
    });
    this.load_img_preview_form(url_img, "img-prev.png", "suggested");
  }

  public async remove_image(): Promise<void> {
    this.messageService.add({
      severity: "error",
      summary: await this.getTranslation("newObject.form.alert"),
      detail: await this.getTranslation("newObject.form.alertImgRemove"),
    });
    this.objectForm.patchValue({
      img: null,
    });
    this.coverSelectionSource = null;
    this.selectedCoverFileName = null;
    this.cdr.detectChanges();
  }

  /**
   * Limpia por completo el flujo luego de cancelar o completar la carga del OA.
   */
  private resetLoadedState(): void {
    this.mainUpload?.clear();
    this.sourceUpload?.clear();
    this.imageUpload?.clear();

    this.objectForm?.reset();
    this.objectForm = this.fb.group({});
    this.object = null;
    this.metaData = null;
    this.file = null;
    this.selectedArchiveFile = null;
    this.objectUrl = null;
    this.displayWindow = false;
    this.tag_count = null;
    this.loading = false;
    this.spinner = false;
    this.first = 0;
    this.isErrorUpload = false;
    this.messagesError = false;
    this.resetUploadDisplayFlags();
    this.viewInfoOA = false;
    this.img_preview_ref = false;
    this.path_img_preview = null;
    this.paths_img_preview = [];
    this.coverSelectionSource = null;
    this.selectedCoverFileName = null;
    this.questionsEvaluationSchema = [];
    this.cdr.detectChanges();
  }

  private syncUploadDisplayFlags(data: UploadDiagnostics | null | undefined): void {
    this.activateDisplaySCORM = !!data?.scorm;
    this.activateDisplayMedia = !!data?.media;
    this.activateDisplayWEBSTE = !!data?.web;
    this.activateDisplayIsExelearning = !!data?.is_exelearning;
  }

  private resetUploadDisplayFlags(): void {
    this.activateDisplayMedia = false;
    this.activateDisplaySCORM = false;
    this.activateDisplayWEBSTE = false;
    this.activateDisplayIsExelearning = false;
  }

  /**
   * Convierte el metadata crudo devuelto por backend al modelo del frontend.
   */
  private buildLoadedObject(metadata: unknown): ObjectLearning {
    const convert = new ConvertLearningObject();
    return convert.toJsonLearningObject(metadata);
  }

}
