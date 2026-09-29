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
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { convertToParamMap } from "@angular/router";
import { By } from "@angular/platform-browser";
import { of, Subject, throwError } from "rxjs";
import { MessageService } from "primeng/api";
import { EditObjectComponent } from "./edit-object.component";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { SearchService } from "../../../../../services/search.service";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";

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
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
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
  @Input() options: any[];
  @Input() optionLabel: string;
  @Input() optionValue: string;
  @Input() showClear: boolean;
  @Input() placeholder: string;
  @Input() fluid: boolean;
  @Input() appendTo: any;
  @Input() appNativeArrowSelect: any[];
  @Input() nativeArrowValueField: string;

  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
  setDisabledState(): void {}
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

describe("EditObjectComponent", () => {
  let fixture: ComponentFixture<EditObjectComponent>;
  let component: EditObjectComponent;
  let objectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let params$: Subject<any>;

  const objectResponse = {
    id: 9,
    general_title: "OA editable",
    general_description: "Descripcion original",
    general_keyword: "algebra, fracciones",
    general_language: "es",
    educational_typicalAgeRange: "12-18",
    adaptation: "no",
    avatar: "http://localhost:8000/media/avatar/oa.png",
    learning_object_file: {
      id: 100,
      url: "http://localhost:8000/media/oa/index.html",
    },
    education_levels: {
      id: 1,
    },
    knowledge_area: {
      id: 7,
    },
    license: {
      id: 3,
    },
  };

  beforeEach(async () => {
    params$ = new Subject<any>();

    objectServiceSpy = jasmine.createSpyObj("LearningObjectService", [
      "getObjectDetailById",
      "editMetadata",
    ]);
    searchServiceSpy = jasmine.createSpyObj("SearchService", [
      "getPreferences",
      "getLevelEducation",
      "getInterestAreas",
      "getLicenses",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    objectServiceSpy.getObjectDetailById.and.returnValue(of(objectResponse as any));
    objectServiceSpy.editMetadata.and.returnValue(
      of({
        ...objectResponse,
        general_title: "OA actualizado",
        general_description: "Descripcion actualizada",
        general_keyword: "integracion, algebra",
        avatar: "http://localhost:8000/media/avatar/oa-actualizado.png",
      } as any)
    );
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

    const translateMock = {
      get: jasmine.createSpy("get").and.callFake((key: string) => of(key)),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [
        EditObjectComponent,
        TranslatePipeMock,
        UrlSanitizerPipeMock,
        SelectControlStubComponent,
        SliderControlStubComponent,
        RadioButtonControlStubComponent,
      ],
      providers: [
        { provide: LearningObjectService, useValue: objectServiceSpy },
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: translateMock,
          },
        },
        {
          provide: BreadcrumbService,
          useValue: breadcrumbServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: params$.asObservable().pipe(),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    params$.next(convertToParamMap({ slug: 9 }));
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("debe precargar el objeto, el formulario y la imagen actual", () => {
    expect(objectServiceSpy.getObjectDetailById).toHaveBeenCalledWith(9);
    expect(component.objectForm).toBeTruthy();
    expect(component.currentImg).toBe(
      "http://localhost:8000/media/avatar/oa.png"
    );
    expect(component.currentFile.url).toBe(
      "http://localhost:8000/media/oa/index.html"
    );

    const titleInput = fixture.nativeElement.querySelector("#title");
    const descriptionInput = fixture.nativeElement.querySelector("#description");
    const keywordsInput = fixture.nativeElement.querySelector("#keywords");
    const currentImage = fixture.nativeElement.querySelector(".avatar-object");

    expect(titleInput?.value).toBe("OA editable");
    expect(descriptionInput?.value).toBe("Descripcion original");
    expect(keywordsInput?.value).toBe("algebra, fracciones");
    expect(currentImage?.getAttribute("src")).toBe(
      "http://localhost:8000/media/avatar/oa.png"
    );
  });

  it("debe enviar la edicion del OA y actualizar la imagen actual", async () => {
    const titleInput = fixture.nativeElement.querySelector("#title");
    const descriptionInput = fixture.nativeElement.querySelector("#description");
    const keywordsInput = fixture.nativeElement.querySelector("#keywords");

    titleInput.value = "OA actualizado";
    titleInput.dispatchEvent(new Event("input"));

    descriptionInput.value = "Descripcion actualizada";
    descriptionInput.dispatchEvent(new Event("input"));

    keywordsInput.value = "integracion, algebra";
    keywordsInput.dispatchEvent(new Event("input"));

    component.objectForm.patchValue({
      general_language: "en",
      education_levels: 1,
      knowledge_area: 7,
      license: 3,
      adaptation: "yes",
      educational_typicalAgeRange: [14, 20],
    });

    const avatar = new File(["image"], "nueva-portada.png", {
      type: "image/png",
    });
    component.onSelectImage({ currentFiles: [avatar] });

    await component.onSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(objectServiceSpy.editMetadata).toHaveBeenCalled();
    const payload = objectServiceSpy.editMetadata.calls.mostRecent().args[0];

    expect(payload.id).toBe(9);
    expect(payload.general_title).toBe("OA actualizado");
    expect(payload.general_description).toBe("Descripcion actualizada");
    expect(payload.general_keyword).toBe("integracion, algebra");
    expect(payload.general_language).toBe("en");
    expect(payload.educational_typicalAgeRange).toBe("14-20");
    expect(payload.adaptation).toBe("yes");
    expect(payload.avatar).toBe(avatar);
    expect(component.currentImg).toBe(
      "http://localhost:8000/media/avatar/oa-actualizado.png"
    );
    expect(component.loading).toBeFalse();
    expect(component.editData).toBeFalse();
    expect(messageServiceSpy.add).toHaveBeenCalled();
  });

  it("debe mostrar error y detener la carga cuando falla la actualizacion", async () => {
    objectServiceSpy.editMetadata.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.objectForm.patchValue({
      general_title: "OA con error",
      general_description: "Descripcion con error",
      general_keyword: "error, prueba",
      general_language: "es",
      education_levels: 1,
      knowledge_area: 7,
      license: 3,
      adaptation: "no",
      educational_typicalAgeRange: [12, 18],
    });

    await component.onSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(objectServiceSpy.editMetadata).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.editData).toBeFalse();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "newObject.form.alert",
      detail: "object.messageError",
    });
  });

  it("el boton cancelar debe navegar sin enviar el formulario", async () => {
    const cancelButton = fixture.nativeElement.querySelector("button.p-button-danger");

    cancelButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["settings/my-objects"]);
    expect(objectServiceSpy.editMetadata).not.toHaveBeenCalled();
  });

  it("debe redirigir a mis objetos si falla la carga inicial del objeto", async () => {
    objectServiceSpy.getObjectDetailById.and.returnValue(
      throwError(() => ({ status: 404 }))
    );

    const secondFixture = TestBed.createComponent(EditObjectComponent);
    const secondComponent = secondFixture.componentInstance;

    secondFixture.detectChanges();
    params$.next(convertToParamMap({ slug: 99 }));
    await secondFixture.whenStable();
    secondFixture.detectChanges();

    expect(secondComponent.object).toBeUndefined();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/settings/my-objects");
  });
});
