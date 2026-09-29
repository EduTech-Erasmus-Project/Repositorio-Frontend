import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";

import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";
import { SideObjectComponent } from "./side-object.component";

describe("SideObjectComponent", () => {
  let component: SideObjectComponent;
  let fixture: ComponentFixture<SideObjectComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let learningObjectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    learningObjectServiceSpy = jasmine.createSpyObj("LearningObjectService", [
      "getRecommendedObjects",
      "searchExpertNoRated",
      "getPopulars",
    ]);
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["validateRole"]);

    learningObjectServiceSpy.getRecommendedObjects.and.returnValue(
      of([
        {
          learning_object: { id: 1, slug: "recomendado", general_title: "OA recomendado" },
          rating: 4.7,
        },
      ] as any)
    );
    learningObjectServiceSpy.searchExpertNoRated.and.returnValue(
      of({
        results: [{ id: 2, slug: "pendiente", general_title: "OA pendiente" }],
      } as any)
    );
    learningObjectServiceSpy.getPopulars.and.returnValue(
      of([
        {
          learning_object: { id: 3, slug: "popular", general_title: "OA popular" },
          rating: 5,
        },
      ] as any)
    );

    await TestBed.configureTestingModule({
      declarations: [SideObjectComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LearningObjectService, useValue: learningObjectServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(SideObjectComponent, "")
      .compileComponents();
  });

  function createComponentWithRoles(roles: string[]) {
    loginServiceSpy.validateRole.and.callFake((role: string) => roles.includes(role));
    fixture = TestBed.createComponent(SideObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("carga recomendados para estudiantes", () => {
    createComponentWithRoles(["student"]);

    expect(learningObjectServiceSpy.getRecommendedObjects).toHaveBeenCalled();
    expect(component.sectionTitleKey).toBe("object.labelRecommended");
    expect(component.objects).toEqual([
      { id: 1, slug: "recomendado", general_title: "OA recomendado", rating: 4.7 },
    ] as any);
  });

  it("carga pendientes sin calificar para expertos", () => {
    createComponentWithRoles(["expert"]);

    expect(learningObjectServiceSpy.searchExpertNoRated).toHaveBeenCalled();
    expect(component.sectionTitleKey).toBe("object.labelNoRated");
    expect(component.objects).toEqual([
      { id: 2, slug: "pendiente", general_title: "OA pendiente", rating: 0 },
    ] as any);
  });

  it("carga populares para usuarios sin rol especial", () => {
    createComponentWithRoles([]);

    expect(learningObjectServiceSpy.getPopulars).toHaveBeenCalled();
    expect(component.sectionTitleKey).toBe("object.labelPopulars");
    expect(component.objects).toEqual([
      { id: 3, slug: "popular", general_title: "OA popular", rating: 5 },
    ] as any);
  });

  it("envia la busqueda lateral a /search con el titulo recortado", () => {
    createComponentWithRoles([]);
    component.title = "  algebra accesible  ";

    component.onSearch();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/search"], {
      queryParams: {
        general_title: "algebra accesible",
      },
    });
  });
});
