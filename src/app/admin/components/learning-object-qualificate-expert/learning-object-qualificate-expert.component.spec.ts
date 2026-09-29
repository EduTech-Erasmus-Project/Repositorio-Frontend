import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { EvaluationService } from "../../services/evaluation.service";
import { LearningObjectQualificateExpertListComponent } from "./learning-object-qualificate-expert.component";

describe("LearningObjectQualificateExpertListComponent", () => {
  let component: LearningObjectQualificateExpertListComponent;
  let fixture: ComponentFixture<LearningObjectQualificateExpertListComponent>;
  let evaluationServiceSpy: jasmine.SpyObj<EvaluationService>;

  beforeEach(async () => {
    evaluationServiceSpy = jasmine.createSpyObj("EvaluationService", [
      "get_qualification_expert_results",
      "update_qualification_expert_results",
    ]);

    evaluationServiceSpy.get_qualification_expert_results.and.returnValue(
      of({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 44,
            rating: 4.5,
            is_priority: false,
            learning_object: { id: 3, general_title: "OA experto", public: 1 },
            collaborating_expert: {
              id: 8,
              first_name: "Luz",
              last_name: "Mora",
              email: "luz@test.com",
            },
          },
        ] as any[],
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [LearningObjectQualificateExpertListComponent],
      providers: [
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: AdminComponent, useValue: {} },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
        { provide: ConfirmationService, useValue: jasmine.createSpyObj("ConfirmationService", ["confirm"]) },
        { provide: Router, useValue: jasmine.createSpyObj("Router", ["navigate"]) },
        { provide: EvaluationService, useValue: evaluationServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: "15" } } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LearningObjectQualificateExpertListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(LearningObjectQualificateExpertListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar evaluaciones de expertos al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(evaluationServiceSpy.get_qualification_expert_results).toHaveBeenCalledWith(15);
    expect(component.learningobjectList.length).toBe(1);
    expect(component.learningobjectList[0].displayRating).toBe("4.50");
    expect(component.isLoading).toBeFalse();
  });

  it("debe abrir y cerrar el dialogo de detalle", () => {
    const evaluation = {
      id: 44,
      displayRating: "4.50",
      learning_object: { id: 3, general_title: "OA experto" },
      collaborating_expert: { id: 8, first_name: "Luz", last_name: "Mora" },
    } as any;

    component.openEvaluationDialog(evaluation);
    expect(component.showEvaluationDialog).toBeTrue();
    expect(component.activeEvaluation).toBe(evaluation);

    component.closeEvaluationDialog();
    expect(component.showEvaluationDialog).toBeFalse();
    expect(component.activeEvaluation).toBeNull();
  });
});
