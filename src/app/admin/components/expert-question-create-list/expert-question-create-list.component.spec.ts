import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { ExpertQuestionCreateListComponent } from "./expert-question-create-list.component";

describe("ExpertQuestionCreateListComponent", () => {
  let component: ExpertQuestionCreateListComponent;
  let fixture: ComponentFixture<ExpertQuestionCreateListComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getEvaluationExpert",
      "postEvaluationExpert",
    ]);

    administratorServiceSpy.getEvaluationExpert.and.returnValue(
      of([{ id: 1, concept: "Recursos visuales" }] as any[])
    );
    administratorServiceSpy.postEvaluationExpert.and.returnValue(
      of({ id: 2, concept: "Nuevo concepto" } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [ExpertQuestionCreateListComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: AdminComponent, useValue: {} },
        { provide: ConfirmationService, useValue: jasmine.createSpyObj("ConfirmationService", ["confirm"]) },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ExpertQuestionCreateListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(ExpertQuestionCreateListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar conceptos al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getEvaluationExpert).toHaveBeenCalled();
    expect(component.conceptList.length).toBe(1);
  });

  it("debe crear un concepto valido", async () => {
    component.concept.concept = "  Nuevo concepto  ";

    component.registerEvaluationData();
    await fixture.whenStable();

    expect(administratorServiceSpy.postEvaluationExpert).toHaveBeenCalled();
    expect(component.createConceptDialog).toBeFalse();
  });
});
