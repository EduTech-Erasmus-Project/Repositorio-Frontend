import { NO_ERRORS_SCHEMA, SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { EvaluationChartComponent } from "./evaluation-chart.component";

describe("EvaluationChartComponent", () => {
  let component: EvaluationChartComponent;
  let fixture: ComponentFixture<EvaluationChartComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    await TestBed.configureTestingModule({
      declarations: [EvaluationChartComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(EvaluationChartComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(EvaluationChartComponent);
    component = fixture.componentInstance;
    component.object = { slug: "oa-demo", is_adapted_oer: false } as any;
  });

  it("arma el grafico experto cuando llegan resultados despues de crear el componente", () => {
    fixture.detectChanges();

    component.idexpe = "docente";
    component.rating = 4.5;
    component.resultEv = [
      {
        concepts: [
          {
            concepto: { concept: "Perceptible" },
            total: 4.2,
          },
        ],
      },
    ];
    component.ngOnChanges({
      idexpe: new SimpleChange(undefined, "docente", false),
      rating: new SimpleChange(undefined, 4.5, false),
      resultEv: new SimpleChange(undefined, component.resultEv, false),
    });
    fixture.detectChanges();

    expect(component.hasExpertResults).toBeTrue();
    expect(component["valid"]).toBe("experto");
    expect((component.data_graf as any).labels).toEqual(["Perceptible"]);
    expect((component.data_graf as any).datasets[0].data).toEqual([4.2]);
  });

  it("arma el grafico estudiantil cuando cambia a modo estudiante", () => {
    component.idexpe = "estudiante";
    component.resultsEvStudent = [
      {
        rating_student: 3.5,
        evaluation_students: [
          {
            average_principle: 3.2,
            evaluation_principle: { principle: "Comprensible" },
          },
        ],
      },
    ] as any;
    component.ngOnChanges({
      idexpe: new SimpleChange(undefined, "estudiante", false),
      resultsEvStudent: new SimpleChange(undefined, component.resultsEvStudent, false),
    });

    fixture.detectChanges();

    expect(component.hasStudentResults).toBeTrue();
    expect(component["valid"]).toBe("student");
    expect((component.data_graf as any).labels).toEqual(["Comprensible"]);
  });

  it("navega al reporte estudiantil con query param", () => {
    component.navigateToReport(true);

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/object", "oa-demo"], {
      queryParams: { rstudent: true },
    });
  });
});
