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
import { TagOA } from "src/app/core/interfaces/TagOA";
import { Console, timeStamp } from "console";

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
  public tag_count : TagOA;
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
    { name: "Elige una opción", code: "none"},
    { name: "Alemán", code: "de"},
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

  private add_item_default_array(array){
    const object_default={
      code:0,
      name: 'Elige una opción'
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
      adaptations: ["yes", [Validators.required]],
      img: [null, [Validators.required]],
      sourceFile:[null],
      language: [null, [Validators.required]],
      age: [
        this.getRageAge() || [5, 100],
        [Validators.required, Validators.min(5), Validators.max(150)],
      ],
      education_levels: [null, [Validators.required]],
      knowledge_area: [null, [Validators.required]],
      license: [null, [Validators.required]],
      
      item_v1: ['no'],
      item_v2: ['no'],
      item_t3: ['no'],
      item_t4: ['no'],
      item_a5: ['no'],
      item_i6: ['no', [Validators.required]],
      is_adapted_oer:[false]
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

  onUpload(evt: any) {
    let lom = JSON.parse(evt.originalEvent.body.metadata);
    this.tag_count = evt.originalEvent.body.tag_count;
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
    this.fill_in_the_answers_automatically_adpated_is_adapted(this.tag_count);
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

  private fill_in_the_answers_automatically_adpated_is_adapted(object_tag_oa){
    let is_adapted = object_tag_oa.is_adapted_oer
    if(is_adapted === true){
      this.objectForm.controls['is_adapted_oer'].setValue(true);
      this.objectForm.controls['item_v1'].setValue('yes');
      this.objectForm.controls['item_v2'].setValue('yes');
      this.objectForm.controls['item_t3'].setValue('yes');
      this.objectForm.controls['item_t4'].setValue('yes');
      this.objectForm.controls['item_a5'].setValue('yes');
      this.objectForm.controls['item_i6'].setValue('yes');
      this.objectForm.controls['adaptations'].setValue('yes');
      this.objectForm.controls['adaptations'].disable();
    }
  }

  async onSubmit() {
    /*Validacion para los nuevos items*/
    if(this.tag_count.img >0){
      this.objectForm.controls['item_v1'].setValidators([Validators.required]);
      this.objectForm.get('item_v1').updateValueAndValidity();
      this.objectForm.controls['item_v2'].setValidators([Validators.required]);
      this.objectForm.get('item_v2').updateValueAndValidity();
    }
    if(this.tag_count.paragraph >0){
      this.objectForm.controls['item_t3'].setValidators([Validators.required]);
      this.objectForm.get('item_t3').updateValueAndValidity();
      this.objectForm.controls['item_t4'].setValidators([Validators.required]);
      this.objectForm.get('item_t4').updateValueAndValidity();
    }
    if(this.tag_count.video >0 || this.tag_count.audio > 0){
      this.objectForm.controls['item_a5'].setValidators([Validators.required]);
      this.objectForm.get('item_a5').updateValueAndValidity();
    }

  
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
      this.object.item_v1 = object_adaptations.item_v1;
      this.object.item_v2 = object_adaptations.item_v2;
      this.object.item_t3 = object_adaptations.item_t3;
      this.object.item_t4 = object_adaptations.item_t4;
      this.object.item_a5 = object_adaptations.item_a5;
      this.object.item_i6 = object_adaptations.item_i6;
      this.object.is_adapted_oer = object_adaptations.is_adapted_oer;
      
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
      this.objectForm.markAllAsTouched();
      this.objectForm.updateValueAndValidity();
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

  onSelectFile(event:any){
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
      education_levels: Number(evt.target.value)
    });
  }

  selectKnowledgeArea(evt){
    this.objectForm.patchValue({
      knowledge_area: Number(evt.target.value)|| null,
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

  get is_adapted_oer(){
    return this.objectForm.get('is_adapted_oer').value;
  }
}
