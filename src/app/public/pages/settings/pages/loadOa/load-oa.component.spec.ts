import {
  Component,
  forwardRef,
  Input,
  NO_ERRORS_SCHEMA,
  Pipe,
  PipeTransform,
} from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { By } from "@angular/platform-browser";
import { of, Subject, throwError } from "rxjs";
import { MessageService } from "primeng/api";
import { TranslateService } from "@ngx-translate/core";
import { LoadOaComponent } from "./load-oa.component";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { SearchService } from "../../../../../services/search.service";
import { LanguageService } from "../../../../../services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdministratorService } from "src/app/services/administrator.service";

@Pipe({
    name: "translate",
    standalone: false
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Pipe({
    name: "urlsanitizer",
    standalone: false
})
class UrlSanitizerPipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Component({
    selector: "p-slider",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SliderControlStubComponent),
            multi: true,
        },
    ],
    standalone: false
})
class SliderControlStubComponent implements ControlValueAccessor {
  @Input() min: number;
  @Input() max: number;
  @Input() range: boolean;

  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
  setDisabledState(): void {}
}

@Component({
    selector: "p-radioButton",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioButtonControlStubComponent),
            multi: true,
        },
    ],
    standalone: false
})
class RadioButtonControlStubComponent implements ControlValueAccessor {
  @Input() name: string;
  @Input() value: any;
  @Input() inputId: string;

  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
  setDisabledState(): void {}
}

@Component({
    selector: "p-select",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectControlStubComponent),
            multi: true,
        },
    ],
    standalone: false
})
class SelectControlStubComponent implements ControlValueAccessor {
  @Input() inputId: string;
  @Input() options: any[] = [];
  @Input() optionLabel: string;
  @Input() optionValue: string;
  @Input() placeholder: string;

  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
  setDisabledState(): void {}
}

describe("LoadOaComponent", () => {
  let fixture: ComponentFixture<LoadOaComponent>;
  let component: LoadOaComponent;
  let learningObjectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let onLangChange$: Subject<any>;

  beforeEach(async () => {
    onLangChange$ = new Subject<any>();

    learningObjectServiceSpy = jasmine.createSpyObj(
      "LearningObjectService",
      ["addQuestionQualificationLearningObject", "addMetadata"],
      {
        urlUpload: "http://localhost:8000/api/v1/learning-object-file/",
      }
    );
    searchServiceSpy = jasmine.createSpyObj("SearchService", [
      "getPreferences",
      "getLevelEducation",
      "getInterestAreas",
      "getLicenses",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getEvaluationAutomaticQuestion",
    ]);

    searchServiceSpy.getPreferences.and.returnValue(
      of([{ id: 1, description: "Preferencia" }])
    );
    searchServiceSpy.getLevelEducation.and.returnValue(
      of({ values: [{ id: 1, name: "Pregrado" }] })
    );
    searchServiceSpy.getInterestAreas.and.returnValue(
      of({ values: [{ id: 7, name: "Matematica" }] })
    );
    searchServiceSpy.getLicenses.and.returnValue(
      of({ values: [{ id: 3, name: "CC-BY" }] })
    );
    administratorServiceSpy.getEvaluationAutomaticQuestion.and.returnValue(
      of([{ id: 10, description: "Cumple con metadata minima" }])
    );
    learningObjectServiceSpy.addQuestionQualificationLearningObject.and.returnValue(
      of({ code: 200 })
    );
    learningObjectServiceSpy.addMetadata.and.returnValue(
      of({ id: 88, source_file: null, is_adapted_oer: false } as any)
    );

    const translateServiceMock = {
      get: jasmine.createSpy("get").and.callFake((key: string) => of(key)),
      instant: jasmine.createSpy("instant").and.callFake((key: string) => key),
      onLangChange: onLangChange$,
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [
        LoadOaComponent,
        TranslatePipeMock,
        UrlSanitizerPipeMock,
        SliderControlStubComponent,
        RadioButtonControlStubComponent,
        SelectControlStubComponent,
      ],
      providers: [
        { provide: LearningObjectService, useValue: learningObjectServiceSpy },
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: translateServiceMock,
          },
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
        {
          provide: BreadcrumbService,
          useValue: breadcrumbServiceSpy,
        },
        {
          provide: AdministratorService,
          useValue: administratorServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadOaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function createUploadEvent(isAdapted = false): any {
    return {
      files: [
        new File(["oa"], isAdapted ? "oa-adaptado.zip" : "oa.zip", {
          type: "application/zip",
        }),
      ],
      originalEvent: {
        body: {
          data: {
            scorm: false,
            media: false,
            web: false,
            is_exelearning: false,
          },
          metadata: JSON.stringify({
            general: {
              title: {
                title: ["OA desde metadata"],
              },
              description: {
                description: ["Descripcion inicial"],
              },
              keyword: {
                keyword: ["algebra", "ecuaciones"],
              },
            },
            educational: {
              typicalAgeRange: {
                typicalAgeRange: ["10-18"],
              },
            },
          }),
          tag_count: {
            is_adapted_oer: isAdapted,
            img_prev: {
              exist: false,
              url_img: "",
              name: "",
            },
            paths_img_preview: [],
          },
          oa_file: {
            id: isAdapted ? 44 : 33,
            url: "http://localhost:8000/media/oa.zip",
          },
        },
      },
    };
  }

  async function uploadObject(isAdapted = false) {
    await component.onUpload(createUploadEvent(isAdapted));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function fillValidAdaptedForm() {
    component.objectForm.patchValue({
      title: "OA adaptado",
      description: "Descripcion adaptada",
      keywords: "adaptado, lom",
      language: "es",
      age: [15, 21],
      education_levels: 1,
      knowledge_area: 7,
      license: 3,
      img: new File(["image"], "adaptado.png", { type: "image/png" }),
    });
    fixture.detectChanges();
  }

  it("debe cargar el formulario real luego de subir un OA no adaptado", async () => {
    await uploadObject(false);

    expect(component.object.general_title).toBe("OA desde metadata");
    expect(component.file?.name).toBe("oa.zip");
    expect(component.objectUrl).toBe("http://localhost:8000/media/oa.zip");
    expect(component.objectForm).toBeTruthy();
    expect(component.objectForm.get("item10")).toBeTruthy();
    expect(component.isErrorUpload).toBeTrue();

    const titleInput = fixture.nativeElement.querySelector("#title");
    const descriptionInput = fixture.nativeElement.querySelector("#description");
    const keywordsInput = fixture.nativeElement.querySelector("#keywords");

    expect(titleInput?.value).toBe("OA desde metadata");
    expect(descriptionInput?.value).toBe("Descripcion inicial");
    expect(keywordsInput?.value).toBe("algebra, ecuaciones");
  });

  it("debe enviar el formulario real y registrar preguntas con el id del archivo del OA no adaptado", async () => {
    await uploadObject(false);

    const titleInput = fixture.nativeElement.querySelector("#title");
    const descriptionInput = fixture.nativeElement.querySelector("#description");
    const keywordsInput = fixture.nativeElement.querySelector("#keywords");

    titleInput.value = "OA integrado";
    titleInput.dispatchEvent(new Event("input"));

    descriptionInput.value = "Descripcion integrada";
    descriptionInput.dispatchEvent(new Event("input"));

    keywordsInput.value = "fraccion, algebra";
    keywordsInput.dispatchEvent(new Event("input"));

    component.objectForm.patchValue({
      education_levels: 1,
      language: "es",
      knowledge_area: 7,
      license: 3,
      img: new File(["image"], "portada.png", { type: "image/png" }),
      age: [10, 18],
      item10: "yes",
    });
    fixture.detectChanges();

    fixture.debugElement.query(By.css("form")).triggerEventHandler("ngSubmit", {});
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      learningObjectServiceSpy.addQuestionQualificationLearningObject
    ).toHaveBeenCalledWith({
      answerQuestion: [
        {
          idQuestion: 10,
          answer: "yes",
        },
      ],
      learning_object_id: 33,
    });

    expect(learningObjectServiceSpy.addMetadata).toHaveBeenCalled();
    const metadataPayload = learningObjectServiceSpy.addMetadata.calls.mostRecent()
      .args[0];

    expect(metadataPayload.general_title).toBe("OA integrado");
    expect(metadataPayload.general_description).toBe("Descripcion integrada");
    expect(metadataPayload.general_keyword).toBe("fraccion, algebra");
    expect(metadataPayload.general_language).toBe("es");
    expect(metadataPayload.educational_typicalAgeRange).toBe("10-18");
    expect(metadataPayload.education_levels).toBe(1);
    expect(metadataPayload.knowledge_area).toBe(7);
    expect(metadataPayload.license).toBe(3);
    expect(metadataPayload.learning_object_file).toBe(33);
  });

  it("debe guardar directamente la metadata cuando el OA ya esta adaptado", async () => {
    await uploadObject(true);

    fillValidAdaptedForm();

    await component.onSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      learningObjectServiceSpy.addQuestionQualificationLearningObject
    ).not.toHaveBeenCalled();
    expect(learningObjectServiceSpy.addMetadata).toHaveBeenCalled();

    const metadataPayload = learningObjectServiceSpy.addMetadata.calls.mostRecent()
      .args[0];
    expect(metadataPayload.learning_object_file).toBe(44);
    expect(metadataPayload.adaptation).toBe("yes");
    expect(metadataPayload.is_adapted_oer).toBeTrue();
  });

  it("debe mostrar el mensaje del backend cuando falla la carga del archivo", () => {
    component.spinner = true;

    component.onError({
      error: {
        error: {
          message: "Archivo no valido",
          data: {
            scorm: true,
            media: false,
            web: true,
          },
        },
      },
    });

    expect(component.spinner).toBeFalse();
    expect(component.activateDisplaySCORM).toBeTrue();
    expect(component.activateDisplayMedia).toBeFalse();
    expect(component.activateDisplayWEBSTE).toBeTrue();
    expect(component.isErrorUpload).toBeTrue();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "Archivo no valido",
    });
  });

  it("debe manejar el error de imagen invalida al guardar metadata", async () => {
    await uploadObject(true);
    fillValidAdaptedForm();
    learningObjectServiceSpy.addMetadata.and.returnValue(
      throwError({
        error: {
          avatar: [
            "Upload a valid image. The file you uploaded was either not an image or a corrupted image.",
          ],
        },
      })
    );

    await component.onSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.messagesError).toBeTrue();
    expect(component.img_preview_ref).toBeFalse();
    expect(component.objectForm.get("img")?.value).toBeNull();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "newObject.infoErrorImage",
    });
  });

  it("debe manejar errores generales de guardado aunque no exista avatar en la respuesta", async () => {
    await uploadObject(true);
    fillValidAdaptedForm();
    learningObjectServiceSpy.addMetadata.and.returnValue(
      throwError({
        error: {
          detail: "Error generico",
        },
      })
    );

    await component.onSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.messagesError).toBeFalse();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "newObject.form.errorSaveData",
    });
  });
});
