import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { EvaluationService } from "../../services/evaluation.service";
import { ViewExpertEvaluationsAdminComponent } from "./view-expert-evaluations-admin.component";

describe("ViewExpertEvaluationsAdminComponent", () => {
  let component: ViewExpertEvaluationsAdminComponent;
  let fixture: ComponentFixture<ViewExpertEvaluationsAdminComponent>;
  let evaluationServiceSpy: jasmine.SpyObj<EvaluationService>;

  beforeEach(async () => {
    evaluationServiceSpy = jasmine.createSpyObj("EvaluationService", [
      "getObjectResultsEvaluationExpertResult_Admin",
    ]);
    evaluationServiceSpy.getObjectResultsEvaluationExpertResult_Admin.and.returnValue(
      of([
        {
          id: 1,
          observation: "Observacion",
          concept_evaluations: [
            {
              evaluation_concept: { concept: "Percepcion" },
              question_evaluations: [
                { id: 1, question: "Pregunta", qualification: "Si" },
              ],
            },
          ],
        },
      ] as any[])
    );

    await TestBed.configureTestingModule({
      declarations: [ViewExpertEvaluationsAdminComponent],
      providers: [{ provide: EvaluationService, useValue: evaluationServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ViewExpertEvaluationsAdminComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(ViewExpertEvaluationsAdminComponent);
    component = fixture.componentInstance;
    component.student_id = 2;
    component.oa_id = 5;
  });

  it("debe cargar el detalle de evaluacion experta", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(evaluationServiceSpy.getObjectResultsEvaluationExpertResult_Admin).toHaveBeenCalledWith(2, 5);
    expect(component.groupedQuestionsEx.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it("debe emitir cierre del dialogo", () => {
    spyOn(component.displayFormRatingExpert, "emit");

    component.closeView();

    expect(component.displayFormRatingExpert.emit).toHaveBeenCalledWith(false);
  });
});
