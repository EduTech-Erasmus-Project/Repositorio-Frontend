import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LearningObjectEvaluatedDetailComponent } from "./learning-object-evaluated-detail.component";

describe("LearningObjectEvaluatedDetailComponent", () => {
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getLearningObjectEvaluatedByExpert",
      "getLearningObject",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
  });

  async function createComponent(routeSnapshot: any) {
    await TestBed.configureTestingModule({
      declarations: [LearningObjectEvaluatedDetailComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: routeSnapshot } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LearningObjectEvaluatedDetailComponent, { set: { template: "" } })
      .compileComponents();

    const fixture = TestBed.createComponent(LearningObjectEvaluatedDetailComponent);
    return { fixture, component: fixture.componentInstance };
  }

  it("debe cargar el detalle evaluado cuando llega expertId", async () => {
    administratorServiceSpy.getLearningObjectEvaluatedByExpert.and.returnValue(
      of({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 22,
            concept_evaluations: [{ id: 1 }],
            learning_object: {
              id: 9,
              slug: "oa-evaluado",
              general_title: "OA evaluado",
              learning_object_file: { url: "https://example.com/index.html" },
              user_created: { id: 7 },
            },
          },
        ] as any[],
      } as any)
    );

    const { fixture, component } = await createComponent({
      params: { expertId: "4", slug: "oa-evaluado" },
      routeConfig: { path: "expert/request/approved/learning-object/evaluated/:id/detail/:slug" },
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getLearningObjectEvaluatedByExpert).toHaveBeenCalledWith(4);
    expect(component.disableEvaluation).toBeTrue();
    expect(component.oaDetail?.slug).toBe("oa-evaluado");
    expect(component.conceptEvaluations.length).toBe(1);
    expect(component.spinner).toBeTrue();
  });

  it("debe cargar solo el detalle del OA cuando viene del flujo de cargados", async () => {
    administratorServiceSpy.getLearningObject.and.returnValue(
      of({
        id: 10,
        slug: "oa-cargado",
        general_title: "OA cargado",
        learning_object_file: { url: "https://example.com/index.html" },
        user_created: { id: 8 },
      } as any)
    );

    const { fixture, component } = await createComponent({
      params: { slug: "oa-cargado" },
      routeConfig: { path: "teacher/request/approved/learning-object/upload/detail/:slug" },
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getLearningObject).toHaveBeenCalledWith("oa-cargado");
    expect(component.disableEvaluation).toBeFalse();
    expect(component.oaDetail?.slug).toBe("oa-cargado");
    expect(component.spinner).toBeTrue();
  });
});
