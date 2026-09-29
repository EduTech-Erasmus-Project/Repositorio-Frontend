import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { EvaluationService } from "../../services/evaluation.service";
import { LearningObjectQualificateStudentListComponent } from "./learning-object-qualificate-student.component";

describe("LearningObjectQualificateStudentListComponent", () => {
  let component: LearningObjectQualificateStudentListComponent;
  let fixture: ComponentFixture<LearningObjectQualificateStudentListComponent>;
  let evaluationServiceSpy: jasmine.SpyObj<EvaluationService>;

  beforeEach(async () => {
    evaluationServiceSpy = jasmine.createSpyObj("EvaluationService", [
      "get_qualification_student_results",
    ]);

    evaluationServiceSpy.get_qualification_student_results.and.returnValue(
      of({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 54,
            rating: 3.75,
            learning_object: { id: 4, general_title: "OA estudiante", public: 1 },
            student: {
              id: 11,
              first_name: "Eva",
              last_name: "Lopez",
              email: "eva@test.com",
            },
          },
        ] as any[],
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [LearningObjectQualificateStudentListComponent],
      providers: [
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: AdminComponent, useValue: {} },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
        { provide: Router, useValue: jasmine.createSpyObj("Router", ["navigate"]) },
        { provide: EvaluationService, useValue: evaluationServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: "16" } } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LearningObjectQualificateStudentListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(LearningObjectQualificateStudentListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar evaluaciones de estudiantes al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(evaluationServiceSpy.get_qualification_student_results).toHaveBeenCalledWith(16);
    expect(component.learningobjectList.length).toBe(1);
    expect(component.learningobjectList[0].displayRating).toBe("3.75");
    expect(component.isLoading).toBeFalse();
  });

  it("debe abrir y cerrar el dialogo de detalle", () => {
    const evaluation = {
      id: 54,
      displayRating: "3.75",
      learning_object: { id: 4, general_title: "OA estudiante" },
      student: { id: 11, first_name: "Eva", last_name: "Lopez" },
    } as any;

    component.openEvaluationDialog(evaluation);
    expect(component.showDetailDialog).toBeTrue();
    expect(component.activeEvaluation).toBe(evaluation);

    component.closeEvaluationDialog();
    expect(component.showDetailDialog).toBeFalse();
    expect(component.activeEvaluation).toBeNull();
  });
});
