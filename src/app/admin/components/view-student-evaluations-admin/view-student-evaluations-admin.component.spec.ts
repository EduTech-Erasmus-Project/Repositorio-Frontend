import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { EvaluationService } from "../../services/evaluation.service";
import { ViewStudentEvaluationsAdminComponent } from "./view-student-evaluations-admin.component";

describe("ViewStudentEvaluationsAdminComponent", () => {
  let component: ViewStudentEvaluationsAdminComponent;
  let fixture: ComponentFixture<ViewStudentEvaluationsAdminComponent>;
  let evaluationServiceSpy: jasmine.SpyObj<EvaluationService>;

  beforeEach(async () => {
    evaluationServiceSpy = jasmine.createSpyObj("EvaluationService", [
      "getObjectResultsEvaluationStudentResult_Admin",
    ]);
    evaluationServiceSpy.getObjectResultsEvaluationStudentResult_Admin.and.returnValue(
      of([
        {
          id: 3,
          observation: "Observacion",
          evaluation_students: [
            {
              id: 4,
              evaluation_principle: { principle: "Percepcion" },
              principle_gl: [
                {
                  guideline_pr: { guideline: "Pauta" },
                  guideline_evaluations: [
                    { id: 5, question_id: 8, question: "Pregunta", qualification: "No" },
                  ],
                },
              ],
            },
          ],
        },
      ] as any[])
    );

    await TestBed.configureTestingModule({
      declarations: [ViewStudentEvaluationsAdminComponent],
      providers: [{ provide: EvaluationService, useValue: evaluationServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewStudentEvaluationsAdminComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(ViewStudentEvaluationsAdminComponent);
    component = fixture.componentInstance;
    component.student_id = 6;
    component.oa_id = 9;
  });

  it("debe cargar el detalle de evaluacion estudiantil", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(evaluationServiceSpy.getObjectResultsEvaluationStudentResult_Admin).toHaveBeenCalledWith(6, 9);
    expect(component.groupedQuestionsUpdate.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it("debe emitir cierre del dialogo", () => {
    spyOn(component.displayFormRatingStuden, "emit");

    component.closeView2();

    expect(component.displayFormRatingStuden.emit).toHaveBeenCalledWith(false);
  });
});
