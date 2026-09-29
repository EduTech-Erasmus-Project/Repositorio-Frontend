import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { MetadataQuestionListComponent } from "./metadata-question-create-list.component";

describe("MetadataQuestionListComponent", () => {
  let component: MetadataQuestionListComponent;
  let fixture: ComponentFixture<MetadataQuestionListComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getEvaluationAutomaticQuestion",
      "getMetadataConceptQuestionsExpert",
      "getEvaluationAutomatic",
      "putRelatioshipQuestionMetadata",
      "retrieveEvaluationAutomaticQuestion",
    ]);

    administratorServiceSpy.getEvaluationAutomaticQuestion.and.returnValue(
      of([{ id: 4, description: "Pregunta auto", descriptionEnglish: "Auto question" }] as any[])
    );
    administratorServiceSpy.getMetadataConceptQuestionsExpert.and.returnValue(
      of([{ id: 6, description: "Schema", evaluation_concept: 3 }] as any[])
    );
    administratorServiceSpy.getEvaluationAutomatic.and.returnValue(
      of([{ id: 3, concept: "Concepto auto" }] as any[])
    );
    administratorServiceSpy.putRelatioshipQuestionMetadata.and.returnValue(
      of({ code: 200 } as any)
    );
    administratorServiceSpy.retrieveEvaluationAutomaticQuestion.and.returnValue(
      of({ schemas_questions: [{ id: 6, description: "Schema" }] } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [MetadataQuestionListComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: AdminComponent, useValue: {} },
        { provide: ConfirmationService, useValue: jasmine.createSpyObj("ConfirmationService", ["confirm"]) },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(MetadataQuestionListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(MetadataQuestionListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar preguntas, metadatos y conceptos al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getEvaluationAutomaticQuestion).toHaveBeenCalled();
    expect(administratorServiceSpy.getMetadataConceptQuestionsExpert).toHaveBeenCalled();
    expect(administratorServiceSpy.getEvaluationAutomatic).toHaveBeenCalled();
    expect(component.selfQuestionList.length).toBe(1);
    expect(component.metadataSchemas.length).toBe(1);
    expect(component.conceptEvaluation.length).toBe(1);
  });

  it("debe guardar una relacion pregunta-metadato", async () => {
    component.metadataSchemaQuestion = {
      id_schema: 6,
      id_question: 4,
      id_concept: 3,
    };

    component.saveSchema();
    await fixture.whenStable();

    expect(administratorServiceSpy.putRelatioshipQuestionMetadata).toHaveBeenCalled();
    expect(administratorServiceSpy.retrieveEvaluationAutomaticQuestion).toHaveBeenCalledWith(4);
  });
});
