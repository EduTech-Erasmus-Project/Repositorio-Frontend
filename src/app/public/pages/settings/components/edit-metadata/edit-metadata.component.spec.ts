import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of, throwError } from "rxjs";
import { MessageService } from "primeng/api";
import { TranslateService } from "@ngx-translate/core";
import { EditMetadataComponent } from "./edit-metadata.component";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { LanguageService } from "src/app/services/language.service";

@Pipe({
    name: "translate",
    standalone: false
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("EditMetadataComponent", () => {
  let fixture: ComponentFixture<EditMetadataComponent>;
  let component: EditMetadataComponent;
  let learningObjectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    learningObjectServiceSpy = jasmine.createSpyObj("LearningObjectService", [
      "editMetadata",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    learningObjectServiceSpy.editMetadata.and.returnValue(of({ id: 77 } as any));

    const translateMock = {
      get: jasmine.createSpy("get").and.callFake((key: string) => of(key)),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EditMetadataComponent, TranslatePipeMock],
      providers: [
        { provide: LearningObjectService, useValue: learningObjectServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: LanguageService,
          useValue: { translate: translateMock },
        },
        {
          provide: TranslateService,
          useValue: translateMock,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditMetadataComponent);
    component = fixture.componentInstance;
    component.object = {
      id: 77,
      general_catalog: "LOM",
      general_keyword: "algebra",
      technical_format: "text/html",
    } as any;
    fixture.detectChanges();
  });

  it("debe construir el formulario con los metadatos editables del objeto", () => {
    expect(component.metadataForm).toBeTruthy();
    expect(component.metadataForm.get("general_catalog")?.value).toBe("LOM");
    expect(component.metadataForm.get("general_keyword")?.value).toBe("algebra");
    expect(component.metadataForm.get("technical_format")?.value).toBe("text/html");
  });

  it("debe guardar metadatos y notificar al padre cuando la actualizacion sale bien", async () => {
    const metadataUpdatedSpy = jasmine.createSpy("metadataUpdated");
    component.metadataUpdated.subscribe(metadataUpdatedSpy);

    component.metadataForm.patchValue({
      general_keyword: "ecuaciones",
    });

    await component.submitMetadataUpdate();

    expect(learningObjectServiceSpy.editMetadata).toHaveBeenCalled();
    expect(learningObjectServiceSpy.editMetadata).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 77,
        general_keyword: "ecuaciones",
      })
    );
    expect(metadataUpdatedSpy).toHaveBeenCalledWith(true);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: "success",
      })
    );
    expect(component.saving).toBeFalse();
  });

  it("debe mostrar mensaje de error si el guardado falla", async () => {
    learningObjectServiceSpy.editMetadata.and.returnValue(
      throwError(() => new Error("save failed"))
    );

    await component.submitMetadataUpdate();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: "error",
      })
    );
    expect(component.saving).toBeFalse();
  });
});
