import { HttpErrorResponse } from "@angular/common/http";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of, Subject, throwError } from "rxjs";
import { ReportsComponent } from "./reports.component";
import { LearningObjectService } from "src/app/services/learning-object.service";

describe("ReportsComponent", () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let params$: Subject<Record<string, unknown>>;
  let queryParams$: Subject<Record<string, unknown>>;
  let objectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const sampleObject = {
    id: 31,
    slug: "oa-demo",
    general_title: "Objeto demo",
    general_coverage: "Cobertura",
    technical_installationRremarks: "Requerimientos",
    general_description: "Descripcion",
    educational_description: "Objetivo",
    general_keyword: "uno,dos",
    technical_location: "Cuenca",
    relation_catalog: "Catalogo",
    educational_difficulty: "Media",
    general_language: "es",
    accesibility_features: "captions",
    user_created: {
      first_name: "Ana",
      last_name: "Perez",
    },
    rating: 4.2,
  } as any;

  beforeEach(async () => {
    params$ = new Subject<Record<string, unknown>>();
    queryParams$ = new Subject<Record<string, unknown>>();
    objectServiceSpy = jasmine.createSpyObj<LearningObjectService>("LearningObjectService", [
      "getObjectDetail",
      "getResultsEvaluation",
      "getObjectResultsPublicEvaluationStudent",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    objectServiceSpy.getObjectDetail.and.returnValue(of(sampleObject));
    objectServiceSpy.getResultsEvaluation.and.returnValue(
      of([
        {
          observation: "Observacion experta",
          concept_evaluations: [
            {
              average: 4,
              evaluation_concept: { concept: "Perceptible" },
              question_evaluations: [
                {
                  question: "Tiene subtitulos",
                  qualification: "Si",
                  schema: "accessibilityfeature:captions",
                  interpreter_yes: "Cuenta con subtitulos",
                  interpreter_partially: "",
                  interpreter_no: "",
                  interpreter_not_apply: "",
                },
              ],
            },
          ],
        },
      ])
    );
    objectServiceSpy.getObjectResultsPublicEvaluationStudent.and.returnValue(
      of([
        {
          rating: 5,
          observation: "Observacion estudiantil",
          evaluation_students: [
            {
              average_principle: 4,
              evaluation_principle: { principle: "Comprensible" },
              principle_gl: [
                {
                  average_guideline: 4,
                  guideline_pr: { guideline: "Contenido claro" },
                  guideline_evaluations: [
                    {
                      question: "El contenido se entiende",
                      qualification: "Si",
                      interpreter_st_yes: "Se entiende con facilidad",
                      interpreter_st_no: "",
                      interpreter_st_partially: "",
                      interpreter_st_not_apply: "",
                      metadata: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ])
    );

    await TestBed.configureTestingModule({
      declarations: [ReportsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: params$.asObservable(),
            queryParams: queryParams$.asObservable(),
          },
        },
        { provide: LearningObjectService, useValue: objectServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ReportsComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("carga el reporte completo y arma pestañas expertas y estudiantiles", async () => {
    queryParams$.next({ rstudent: "true" });
    params$.next({ slug: "oa-demo" });
    await fixture.whenStable();

    expect(component.isStudentReport).toBeTrue();
    expect(objectServiceSpy.getObjectDetail).toHaveBeenCalledWith("oa-demo");
    expect(objectServiceSpy.getResultsEvaluation).toHaveBeenCalledWith(31);
    expect(objectServiceSpy.getObjectResultsPublicEvaluationStudent).toHaveBeenCalledWith(31);
    expect(component.loading).toBeFalse();
    expect(component.reportModeLabel).toBe("Reporte de estudiante");
    expect(component.objectTitle).toBe("Objeto demo");
    expect(component.authorName).toBe("Ana Perez");
    expect(component.expertTabs[0].count).toBe(1);
    expect(component.studentTabs[0].count).toBe(1);
    expect(component.metadataRows).toEqual([
      {
        id: "accessibilityfeature:captions",
        matches: "Si",
        suggestedAction: "-",
      },
    ]);
    expect(component.currentObservation).toBe("Observacion estudiantil");
  });

  it("redirecciona a notfound cuando el OA del reporte no existe", async () => {
    objectServiceSpy.getObjectDetail.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404 }))
    );

    params$.next({ slug: "inexistente" });
    await fixture.whenStable();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/notfound"]);
  });

  it("redirecciona a error cuando falla el detalle del reporte", async () => {
    objectServiceSpy.getObjectDetail.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    params$.next({ slug: "fallo" });
    await fixture.whenStable();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/error"]);
  });
});
