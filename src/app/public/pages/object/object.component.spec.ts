import { HttpErrorResponse } from "@angular/common/http";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router, convertToParamMap } from "@angular/router";
import { of, Subject, throwError } from "rxjs";
import { ObjectComponent } from "./object.component";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";
import { MessageService } from "primeng/api";

describe("ObjectComponent", () => {
  let component: ObjectComponent;
  let fixture: ComponentFixture<ObjectComponent>;
  let params$: Subject<ParamMap>;
  let objectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const languageServiceStub = {
    translate: {
      get: jasmine.createSpy("get").and.callFake((key: string) => of(key)),
    },
  };

  const sampleObject = {
    id: 7,
    slug: "demo-oa",
    general_title: "Demo OA",
    learning_object_file: {
      url: "https://example.com/demo/index.html",
    },
  } as any;

  beforeEach(async () => {
    params$ = new Subject<ParamMap>();
    objectServiceSpy = jasmine.createSpyObj<LearningObjectService>(
      "LearningObjectService",
      [
        "getObjectDetail",
        "getComments",
        "getResultsEvaluation",
        "getObjectResultsEvaluation",
        "setSelectedLearningObject",
      ]
    );
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["validateRole"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    loginServiceSpy.validateRole.and.returnValue(false);
    objectServiceSpy.getObjectDetail.and.returnValue(of(sampleObject));
    objectServiceSpy.getComments.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ObjectComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params$.asObservable() } },
        { provide: LearningObjectService, useValue: objectServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: LanguageService, useValue: languageServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ObjectComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(ObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("carga el detalle del OA, comentarios y embed code desde el slug", async () => {
    await component.getObjectDetail("demo-oa");
    await fixture.whenStable();

    expect(objectServiceSpy.getObjectDetail).toHaveBeenCalledWith("demo-oa");
    expect(objectServiceSpy.getComments).toHaveBeenCalledWith(7);
    expect(component.objectData).toEqual(sampleObject);
    expect(component.embedCode).toContain("https://example.com/demo/index.html");
    expect(objectServiceSpy.setSelectedLearningObject).toHaveBeenCalledWith(sampleObject);
  });

  it("redirecciona a notfound cuando el detalle responde 404", async () => {
    objectServiceSpy.getObjectDetail.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404 }))
    );

    await component.getObjectDetail("inexistente");

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/notfound"]);
  });

  it("redirecciona a error cuando el detalle falla con otro estado", async () => {
    objectServiceSpy.getObjectDetail.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    await component.getObjectDetail("fallo");

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/error"]);
  });

  it("carga resultados de estudiante cuando el rol es student", async () => {
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "student");
    objectServiceSpy.getResultsEvaluation.and.returnValue(
      of([
        {
          concept_evaluations: [
            {
              evaluation_concept: { concept: "Perceptible" },
              average: 4.5,
              question_evaluations: [],
            },
          ],
        },
      ])
    );
    component.objectData = { id: 11 } as any;

    await component.loadData();

    expect(objectServiceSpy.getResultsEvaluation).toHaveBeenCalledWith(11);
    expect(component.resultsEva).toEqual([
      {
        concepts: [{ concepto: { concept: "Perceptible" }, total: 4.5 }],
      },
    ]);
    expect(component.hasStudentEvaluation).toBeTrue();
    expect(component.shouldShowEvaluationEmptyState).toBeFalse();
  });

  it("muestra estado vacio para estudiante cuando no hay evaluaciones", () => {
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "student");
    component.resultsEva = [];

    expect(component.hasStudentEvaluation).toBeFalse();
    expect(component.shouldShowEvaluationEmptyState).toBeTrue();
  });

  it("carga resultados de experto y arma controles del formulario", async () => {
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "expert");
    objectServiceSpy.getObjectResultsEvaluation.and.returnValue(
      of([
        {
          id: 9,
          observation: "Observacion del experto",
          concept_evaluations: [
            {
              evaluation_concept: { concept: "Operable" },
              average: 3,
              question_evaluations: [
                {
                  id: 101,
                  question: "La navegacion es clara",
                  qualification: "4",
                },
              ],
            },
          ],
        },
      ])
    );
    component.objectData = { id: 15 } as any;

    await component.loadData();

    expect(objectServiceSpy.getObjectResultsEvaluation).toHaveBeenCalledWith(15);
    expect(component.groupedQuestionsEx.length).toBe(1);
    expect(component.groupedQuestionsEx[0].conceptEvaluations[0].questionEvaluations[0].qualification).toBe("4");
    expect(component.groupedQuestionsEx[0].observation).toBe("Observacion del experto");
    expect(component.flagConfirm).toBeTrue();
  });
});
