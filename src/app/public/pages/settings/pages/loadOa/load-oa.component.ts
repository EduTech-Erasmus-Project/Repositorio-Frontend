import { Component, OnInit, OnDestroy } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { ConvertLearningObject } from "../../../../../core/models/ConvertLearningObject";
import { TokenService } from "../../../../../services/token.service";
import { Subscription } from "rxjs";
import { SearchService } from "../../../../../services/search.service";
import { Preference } from "../../../../../core/interfaces/Preference";
import { EducationLevel } from "../../../../../core/interfaces/EducationLevel";
import { KnowledgeArea } from "../../../../../core/interfaces/KnowledgeArea";
import { License } from "../../../../../core/interfaces/License";
import { MessageService } from "primeng/api";
import { LanguageService } from "../../../../../services/language.service";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";

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
  public objectForm: FormGroup;
  private subscriptions: Subscription[] = [];

  public preferencesData: Preference[];
  public educationLevels: EducationLevel[];
  public knowledgeArea: KnowledgeArea[];
  public licenses: License[];

  public loading: boolean = false;

  private messages = {
    successFile: "",
    errorFile: "",
    successMetadata: "",
    errorMetadata: "",
  };

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

  constructor(
    private fb: FormBuilder,
    private learningObjectService: LearningObjectService,
    private tokenService: TokenService,
    private searchService: SearchService,
    private messageService: MessageService,
    private languageService: LanguageService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.baseUrl = this.learningObjectService.urlUpload;
    let tokenSub = this.tokenService.refreshToken().subscribe((res) => {});
    this.subscriptions.push(tokenSub);
    this.loadData();

    this.translate = this.languageService.translate;
    this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
      this.messages = translate.translations.newObject.messages;
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
      });

    let knowledgeAreaSub = await this.searchService
      .getInterestAreas()
      .subscribe((res) => {
        this.knowledgeArea = res.values.map((res) => {
          return { name: res.name, code: res.id };
        });
      });

    let licensesSub = await this.searchService
      .getLicenses()
      .subscribe((res: any) => {
        this.licenses = res.values.map((res) => {
          return { name: res.name, code: res.id };
        });
      });

    this.subscriptions.push(
      preferencesSub,
      educationLevelsSub,
      knowledgeAreaSub,
      licensesSub
    );
  }

  loadForm() {
    this.objectForm = this.fb.group({
      title: [this.object?.general_title || null, [Validators.required]],
      description: [
        this.object?.general_description || null,
        [Validators.required],
      ],
      keywords: [this.object?.general_keyword || null, [Validators.required]],
      adaptations: ["yes", [Validators.required]],
      img: [null, [Validators.required]],
      language: [null, [Validators.required]],
      age: [
        this.getRageAge() || [5, 100],
        [Validators.required, Validators.min(5), Validators.max(150)],
      ],
      education_levels: [null, [Validators.required]],
      knowledge_area: [null, [Validators.required]],
      license: [null, [Validators.required]],
    });
  }

  getRageAge() {
    if (this.object.educational_typicalAgeRange) {
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

  onUpload(evt: any) {
    
    console.log("onUpload", evt);

    let lom = evt.originalEvent.body.metadata.lom;
    this.metaData = evt.originalEvent.body;
    this.file = evt.files[0];
    this.objectUrl = evt.originalEvent.body.oa_file.url;

    let convert = new ConvertLearningObject();
    this.object = convert.toJsonLearningObject(lom);

    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: "El archivo se ah subido con éxito",
    });
    this.loadForm();
  }

  onError(evt) {
    console.log("on error upload", evt.error.error.message);
    let message : string = evt.error.error.message;
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  }

  async onSubmit() {
    //console.log("this.objectForm", this.objectForm);

    if (this.objectForm.valid) {
      this.loading = true;
      this.object.learning_object_file = this.metaData.oa_file.id;
      this.object.adaptation = this.objectForm.value.adaptations;
      this.object.general_title = this.objectForm.value.title;
      this.object.general_description = this.objectForm.value.description;
      this.object.general_keyword = this.objectForm.value.keywords;
      this.object.general_language = this.objectForm.value.language;
      this.object.educational_typicalAgeRange = `${this.objectForm.value.age[0]}-${this.objectForm.value.age[1]}`;
      this.object.education_levels = this.objectForm.value.education_levels;
      this.object.knowledge_area = this.objectForm.value.knowledge_area;
      this.object.license = this.objectForm.value.license;
      this.object.general_language = this.objectForm.value.language;
      this.object.avatar = this.objectForm.value.img;
      
      let addMetadataSub = await this.learningObjectService
        .addMetadata(this.object)
        .subscribe(
          (res) => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Tu archivo se ha enviado para revisión",
            });
            this.objectForm.reset();
            this.object = null;
            this.metaData = null;
            this.file = null;
            this.objectUrl = null;
            this.loading = false;
          },
          (err) => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail:
                "Se ha producido un error al guardar los datos, intente de nuevo",
            });
            this.loading = false;
          }
        );
      this.subscriptions.push(addMetadataSub);
    } else {
      this.markTouchForm();
    }
  }

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
      education_levels: evt.value?.code || null,
    });
  }

  selectKnowledgeArea(evt) {
    this.objectForm.patchValue({
      knowledge_area: evt.value?.code || null,
    });
  }

  selectLicense(evt) {
    this.objectForm.patchValue({
      license: evt.value?.code || null,
    });
  }

  selectLanguage(evt) {
    this.objectForm.patchValue({
      language: evt.value?.code || null,
    });
  }
}
