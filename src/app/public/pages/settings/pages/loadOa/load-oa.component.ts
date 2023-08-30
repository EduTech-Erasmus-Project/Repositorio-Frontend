import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  Validators,
  UntypedFormBuilder,
  UntypedFormGroup,
  UntypedFormControl,
} from "@angular/forms";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { ConvertLearningObject } from "../../../../../core/models/ConvertLearningObject";
import { TokenService } from "../../../../../services/token.service";
import { Observable, Subscription } from "rxjs";
import { SearchService } from "../../../../../services/search.service";
import { Preference } from "../../../../../core/interfaces/Preference";
import { EducationLevel } from "../../../../../core/interfaces/EducationLevel";
import { KnowledgeArea } from "../../../../../core/interfaces/KnowledgeArea";
import { License } from "../../../../../core/interfaces/License";
import { Message, MessageService } from "primeng/api";
import { LanguageService } from "../../../../../services/language.service";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { PathsImgPreview, TagOA } from "src/app/core/interfaces/TagOA";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdministratorService } from "src/app/services/administrator.service";
import { QuestionEvaluation } from "src/app/core/interfaces/QuestionEvaluation";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-load-oa",
  templateUrl: "./load-oa.component.html",
  styleUrls: ["./load-oa.component.scss"],
})
export class LoadOaComponent implements OnInit, OnDestroy {
  public translate: TranslateService;
  public baseUrl: string;
  public objectUrl: string;
  public object: ObjectLearning;
  public file: File;
  public metaData: any;
  public displayWindow: boolean;
  public objectForm: UntypedFormGroup;
  private subscriptions: Subscription[] = [];
  public tag_count: TagOA;
  public preferencesData: Preference[];
  public educationLevels: EducationLevel[];
  public knowledgeArea: KnowledgeArea[];
  public licenses: License[];
  public img_preview_ref: boolean = false;
  public path_img_preview: string;
  public loading: boolean = false;
  public paths_img_preview: PathsImgPreview[];
  public questionsEvaluationSchema: QuestionEvaluation[];
  private messages = {
    successFile: "",
    errorFile: "",
    successMetadata: "",
    errorMetadata: "",
  };
  public spinner: boolean = false;
  public first: number = 0;
  public language = [
    { name: "Alemán", code: "de" },
    { name: "Español", code: "es" },
    { name: "Francés", code: "fr" },
    { name: "Holandés", code: "nl" },
    { name: "Húngaro", code: "hu" },
    { name: "Ingles", code: "en" },
    { name: "Italiano", code: "it" },
    { name: "Portugués", code: "pt" },
    { name: "Ruso", code: "ru" },
    { name: "Otros", code: "Other" },
  ];

  public isErrorUpload: boolean = false;
  public messagesError: boolean = false;

  public activateDisplayMedia: boolean = false;
  public activateDisplaySCORM: boolean = false;
  public activateDisplayWEBSTE: boolean = false;
  public viewInfoOA: boolean = false;
  constructor(
    private fb: UntypedFormBuilder,
    private learningObjectService: LearningObjectService,
    private tokenService: TokenService,
    private searchService: SearchService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private h: HttpClient,
    private sanitizer: DomSanitizer,
    private breadcrumbService: BreadcrumbService,
    private administrationService: AdministratorService
  ) {
    this.item_language();
    this.add_breadcrumb();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.baseUrl = this.learningObjectService.urlUpload;
    let tokenSub = this.tokenService.refreshToken().subscribe((res) => { });
    this.subscriptions.push(tokenSub);
    this.loadData();

    this.translate = this.languageService.translate;
    this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
      this.messages = translate.translations.newObject.messages;
    });
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: await this.languageService.translate
          .get("menu.settings")
          .toPromise(),
      },
      {
        label: await this.languageService.translate
          .get("menu.sideMenu.uploadOA")
          .toPromise(),
        routerLink: ["/settings/new-object"],
      },
    ]);
  }

  private async item_language() {
    this.language.unshift({
      name: await this.languageService.translate
        .get("register.chooseOption")
        .toPromise(),
      code: "none",
    });
  }
  async loadData() {
    let preferencesSub = await this.searchService
      .getPreferences()
      .subscribe((res) => {
        this.preferencesData = res.map((res) => {
          return { name: res.description, code: res.id };
        });
      });

    let educationLevelsSub = await this.searchService
      .getLevelEducation()
      .subscribe((res) => {
        this.educationLevels = res.values.map((res) => {
          return { name: res.name, code: res.id };
        });
        this.add_item_default_array(this.educationLevels);
      });

    let knowledgeAreaSub = await this.searchService
      .getInterestAreas()
      .subscribe((res) => {
        this.knowledgeArea = res.values.map((res) => {
          return { name: res.name, code: res.id };
        });

        this.add_item_default_array(this.knowledgeArea);
      });

    let licensesSub = await this.searchService
      .getLicenses()
      .subscribe((res: any) => {
        this.licenses = res.values.map((res) => {
          return { name: res.name, code: res.id };
        });
        this.add_item_default_array(this.licenses);
      });

    this.subscriptions.push(
      preferencesSub,
      educationLevelsSub,
      knowledgeAreaSub,
      licensesSub
    );
  }

  private async add_item_default_array(array) {
    const object_default = {
      code: 0,
      name: await this.languageService.translate
        .get("register.chooseOption")
        .toPromise(),
    };
    array.unshift(object_default);
  }

  loadForm() {
    this.objectForm = this.fb.group({
      title: [this.object?.general_title || null, [Validators.required]],
      description: [
        this.object?.general_description || null,
        [Validators.required],
      ],
      keywords: [this.object?.general_keyword || null, [Validators.required]],
      adaptations: ["no", [Validators.required]],
      img: [null, [Validators.required]],
      sourceFile: [null],
      language: [null, [Validators.required]],
      age: [
        this.getRageAge() || [5, 100],
        [Validators.required, Validators.min(5), Validators.max(150)],
      ],
      education_levels: [null, [Validators.required]],
      knowledge_area: [null, [Validators.required]],
      license: [null, [Validators.required]],
      is_adapted_oer: [false],
    });
  }

  getRageAge() {
    if (this.object?.educational_typicalAgeRange) {
      let range = this.object?.educational_typicalAgeRange.split("-");
      if (range?.length > 2) {
        range.map((res) => {
          return parseInt(res);
        });
      } else {
        return [5, 100];
      }
    } else {
      return [5, 100];
    }
  }

  async onUpload(evt: any) {
    this.spinner = false;
    this.isErrorUpload = false;

    this.activateDisplaySCORM = evt.originalEvent.body.data.scorm;
    this.activateDisplayMedia = evt.originalEvent.body.data.media;
    this.activateDisplayWEBSTE = evt.originalEvent.body.data.web;
    this.isErrorUpload = true;

    let lom = JSON.parse(evt.originalEvent.body.metadata);
    this.tag_count = evt.originalEvent.body.tag_count;
    this.metaData = evt.originalEvent.body;
    this.file = evt.files[0];
    this.objectUrl = evt.originalEvent.body.oa_file.url;

    let convert = new ConvertLearningObject();
    this.object = convert.toJsonLearningObject(lom);
    this.messageService.add({
      severity: "success",
      summary: await this.languageService.translate
        .get("newObject.form.success")
        .toPromise(),
      detail: await this.languageService.translate
        .get("newObject.form.successUploadFile")
        .toPromise(),
    });

    if (this.tag_count.is_adapted_oer != true) {
      this.getQuestionsEvaluation();
    }

    this.loadForm();
    this.fill_in_the_answers_automatically_adpated_is_adapted(this.tag_count);
  }

  progress_event(evt) {
    this.spinner = true;
  }
  onError(evt) {
    //console.log(evt);
    //console.log("on error upload", evt.error.error.message);
    this.spinner = false;
    this.activateDisplaySCORM = evt.error.error.data.scorm;
    this.activateDisplayMedia = evt.error.error.data.media;
    this.activateDisplayWEBSTE = evt.error.error.data.web;
    this.isErrorUpload = true;
    let message: string = evt.error.error.message || evt.error.message;
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  }

  private fill_in_the_answers_automatically_adpated_is_adapted(object_tag_oa) {
    this.isErrorUpload = true;
    let is_adapted = object_tag_oa.is_adapted_oer;

    if (is_adapted === true) {
      this.objectForm.controls["is_adapted_oer"].setValue(true);
      this.objectForm.controls["adaptations"].setValue("yes");
      this.objectForm.controls["adaptations"].disable();
    }

    let is_img_preview = object_tag_oa.img_prev.exist;
    if (is_img_preview) {
      this.img_preview_ref = true;
      this.path_img_preview = object_tag_oa.img_prev.url_img;
      const name_img = object_tag_oa.img_prev.name;
      this.load_img_preview_form(this.path_img_preview, name_img);
    } else {
      this.img_preview_ref = false;
    }

    if (Array.isArray(object_tag_oa.paths_img_preview)) {
      this.paths_img_preview = object_tag_oa.paths_img_preview;
      let array_aux_paths = [];
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
    let questionEval: QuestionEvaluation[] = await this.administrationService
      .getEvaluationAutomaticQuestion()
      .toPromise();
    if (questionEval.length > 0) {
      this.questionsEvaluationSchema = questionEval;
      this.questionsEvaluationSchema.forEach((element) => {
        this.objectForm.addControl(
          "item" + element.id.toString(),
          new UntypedFormControl(null, [Validators.required])
        );
      });
    }
  }

  private load_img_preview_form(URL_img, name_img) {
    let image: Blob;
    let imageURL: SafeUrl;
    /**
     * Esto se realiza con la finalidad de 
     * que el servidor pueda descargar las imagenes 
     *  ya que no da acceso a descargar imagenes de una url no segura 
     */
    if (environment.production == true) {
      let exist_security_url = URL_img.indexOf("http://");
      if (exist_security_url !== -1) {
        URL_img = URL_img.replace("http://", "https://");
      }
    }

    this.loadImage_blob(URL_img).subscribe((i) => {
      image = i;
      imageURL = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(image)
      );
      const file: any = new File([image], name_img, { type: "image/png" });
      file.objectURL = imageURL;
      this.objectForm.patchValue({
        img: file,
      });
    });
  }

  private loadImage_blob(URL): Observable<Blob> {
    return this.h.get(URL, {
      responseType: "blob",
    });
  }

  async onSubmit() {
    this.objectForm.markAllAsTouched();
    this.objectForm.updateValueAndValidity();
    /*Validacion para los nuevos items*/
    // if (this.tag_count.img > 0) {
    //   this.set_salidators_form_controls("item_v1");
    //   this.set_salidators_form_controls("item_v2");
    // }
    // if (this.tag_count.paragraph > 0) {
    //   this.set_salidators_form_controls("item_t3");
    //   this.set_salidators_form_controls("item_t4");
    // }
    // if (this.tag_count.video > 0 || this.tag_count.audio > 0) {
    //   this.set_salidators_form_controls("item_a5");
    // }

    if (this.objectForm.valid) {
      //Obtener los campos por si estubieran desabilitados
      let object_adaptations = this.objectForm.getRawValue();
      this.loading = true;
      this.object.learning_object_file = this.metaData.oa_file.id;
      this.object.adaptation = object_adaptations.adaptations;
      this.object.general_title = object_adaptations.title;
      this.object.general_description = object_adaptations.description;
      this.object.general_keyword = object_adaptations.keywords;
      this.object.general_language = object_adaptations.language;
      this.object.educational_typicalAgeRange = `${object_adaptations.age[0]}-${object_adaptations.age[1]}`;
      this.object.education_levels = object_adaptations.education_levels;
      this.object.knowledge_area = object_adaptations.knowledge_area;
      this.object.license = object_adaptations.license;
      this.object.avatar = object_adaptations.img;
      this.object.source_file = object_adaptations.sourceFile;
      this.object.is_adapted_oer = object_adaptations.is_adapted_oer;
      if (this.tag_count.is_adapted_oer != true) {
        const arrayQuestionsSchemaResponse = this.createOfQuestionsArray();
        //this.object.arrayAnswer = arrayQuestionsSchemaResponse;
        let data_answer = {
          answerQuestion: arrayQuestionsSchemaResponse,
          learning_object_id: this.object.learning_object_file,
        };

        let questionQualification = await this.learningObjectService
          .addQuestionQualificationLearningObject(data_answer)
          .subscribe(
            async (res: any) => {
              if (res.code === 200) {
                let addMetadataSub = await this.learningObjectService
                  .addMetadata(this.object)
                  .subscribe(
                    async (res) => {
                      this.formatVariables();
                    },
                    async (err) => {
                      this.captureImageError(err);
                    }
                  );
                this.subscriptions.push(addMetadataSub);
              }
            },
            async (err) => {
              this.loading = false;
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: await this.languageService.translate
                  .get("newObject.form.invalidForm")
                  .toPromise(),
              });
            }
          );
        this.subscriptions.push(questionQualification);
      } else {
        let addMetadataSub = await this.learningObjectService
          .addMetadata(this.object)
          .subscribe(
            async (res) => {
              this.formatVariables();
            },
            async (err) => {
              this.captureImageError(err);
            }
          );
        this.subscriptions.push(addMetadataSub);
      }
    } else {
      this.loading = false;
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: await this.languageService.translate
          .get("newObject.form.invalidForm")
          .toPromise(),
      });
    }
  }

  /**
   * funcion para formatear la variables
   * luego de enviar los datos del objeto de aprendizaje
   * @method formatVariables
   */
  private async formatVariables() {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: await this.languageService.translate
        .get("newObject.form.fileSendReview")
        .toPromise(),
    });
    this.objectForm.reset();
    this.object = null;
    this.metaData = null;
    this.file = null;
    this.objectUrl = null;
    this.loading = false;
  }

  /**
   * Funcion para ejecutar el error cuando existen problemas
   * en las imagenes
   * @method captureImageError
   */
  private async captureImageError(err) {
    if (
      err.error?.avatar[0] ===
      "Upload a valid image. The file you uploaded was either not an image or a corrupted image."
    ) {
      this.img_preview_ref = false;
      this.objectForm.controls["img"].setValue(null);
      this.objectForm.markAllAsTouched();
      this.objectForm.updateValueAndValidity();
      this.loading = false;
      this.messagesError = true;
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: await this.languageService.translate
          .get("newObject.infoErrorImage")
          .toPromise(),
      });
    } else {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: await this.languageService.translate
          .get("newObject.form.errorSaveData")
          .toPromise(),
      });
      this.loading = false;
    }
  }

  /**
   * Funcion para crear el array de las respuestas a las preguntas creadas
   * por el administrador
   * @method createOfQuestionsArray
   * @returns
   */
  private createOfQuestionsArray() {
    let arrayResponse = new Array();

    this.questionsEvaluationSchema.forEach((element: any) => {
      let data = {
        idQuestion: element.id,
        answer: this.objectForm.get("item" + element.id)?.value,
      };
      arrayResponse.push(data);
    });
    return arrayResponse;
  }

  // private set_salidators_form_controls(name_control: string) {
  //   this.objectForm.controls[name_control].setValidators([Validators.required]);
  //   this.objectForm.get(name_control).updateValueAndValidity();
  // }

  markTouchForm() {
    (<any>Object).values(this.objectForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  onSelectImage(evet: any) {
    this.objectForm.patchValue({
      img: evet.currentFiles[0],
    });
  }

  onSelectFile(event: any) {
    this.objectForm.patchValue({
      sourceFile: event.currentFiles[0],
    });
  }

  showBasicDialog2() {
    this.displayWindow = true;
  }

  navigate() {
    window.open(this.objectUrl, "_blank");
  }

  getErrorFormRequired(formValue): boolean {
    return (
      this.objectForm.get(formValue).hasError("required") &&
      this.objectForm.get(formValue).touched
    );
  }

  get errorErrorEmail(): boolean {
    return (
      this.objectForm.get("email").errors?.pattern &&
      this.objectForm.get("email").touched
    );
  }

  selectLevel(evt) {
    this.objectForm.patchValue({
      education_levels: Number(evt.target.value),
    });
  }

  selectKnowledgeArea(evt) {
    this.objectForm.patchValue({
      knowledge_area: Number(evt.target.value) || null,
    });
  }

  selectLicense(evt) {
    this.objectForm.patchValue({
      license: Number(evt.target.value) || null,
    });
  }

  selectLanguage(evt) {
    this.objectForm.patchValue({
      language: evt.target.value || null,
    });
  }

  get is_adapted_oer() {
    return this.objectForm.get("is_adapted_oer").value;
  }

  onPageChange(event) {
    this.first = event.first;
  }

  refresh() {
    this.first = 0;
  }
  get image() {
    const array = this.paths_img_preview[this.first];
    return array;
  }

  get totalRecords() {
    return this.paths_img_preview.length;
  }

  public async img_preview_save(url_img) {
    this.messageService.add({
      severity: "success",
      summary: await this.languageService.translate
        .get("newObject.form.success")
        .toPromise(),
      detail: await this.languageService.translate
        .get("newObject.form.alertSuccessSelect")
        .toPromise(),
    });
    this.load_img_preview_form(url_img, "img-prev.png");
  }

  public async remove_image() {
    this.messageService.add({
      severity: "error",
      summary: await this.languageService.translate
        .get("newObject.form.alert")
        .toPromise(),
      detail: await this.languageService.translate
        .get("newObject.form.alertImgRemove")
        .toPromise(),
    });
    this.objectForm.patchValue({
      img: null,
    });
  }
}
