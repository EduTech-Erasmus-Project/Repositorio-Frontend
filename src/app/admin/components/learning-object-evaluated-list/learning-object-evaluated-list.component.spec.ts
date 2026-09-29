import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LearningObjectEvaluatedListComponent } from "./learning-object-evaluated-list.component";

describe("LearningObjectEvaluatedListComponent", () => {
  let component: LearningObjectEvaluatedListComponent;
  let fixture: ComponentFixture<LearningObjectEvaluatedListComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getLearningObjectEvaluatedByExpert",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    administratorServiceSpy.getLearningObjectEvaluatedByExpert.and.returnValue(
      of({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 31,
            learning_object: { id: 8, slug: "oa-evaluado" },
          },
        ] as any[],
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [LearningObjectEvaluatedListComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { id: "21" },
              routeConfig: { path: "expert/request/approved/learning-object/evaluated/:id" },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LearningObjectEvaluatedListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(LearningObjectEvaluatedListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar OAs evaluados por el usuario aprobado", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getLearningObjectEvaluatedByExpert).toHaveBeenCalledWith(21);
    expect(component.learningobjects.length).toBe(1);
    expect(component.adminRole).toBe("expert");
    expect(component.hasLoaded).toBeTrue();
  });

  it("debe navegar al detalle consolidado de evaluacion", () => {
    component.getLearningObjectDetail("oa-evaluado");

    expect(routerSpy.navigate).toHaveBeenCalledWith([
      "/admin/expert/request/approved/learning-object/evaluated/21/detail/oa-evaluado",
    ]);
  });
});
