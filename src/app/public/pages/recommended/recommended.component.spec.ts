import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { RecommendedComponent } from "./recommended.component";

describe("RecommendedComponent", () => {
  let fixture: ComponentFixture<RecommendedComponent>;
  let component: RecommendedComponent;
  let learningObjectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    learningObjectServiceSpy = jasmine.createSpyObj("LearningObjectService", [
      "getRecommendedObjects",
      "getPopulars",
    ]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", [
      "setItems",
    ]);
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["validateRole"]);

    await TestBed.configureTestingModule({
      declarations: [RecommendedComponent],
      providers: [
        { provide: LearningObjectService, useValue: learningObjectServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Recomendados")),
            },
          },
        },
        { provide: LoginService, useValue: loginServiceSpy },
      ],
    })
      .overrideComponent(RecommendedComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  function setRoles(roles: string[]) {
    loginServiceSpy.validateRole.and.callFake((role: string) =>
      roles.includes(role)
    );
  }

  function createComponent() {
    fixture = TestBed.createComponent(RecommendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function flushRecommendedLoading() {
    tick(500);
    fixture.detectChanges();
  }

  it("debe cargar recomendados y populares para roles habilitados", fakeAsync(() => {
    setRoles(["student"]);
    learningObjectServiceSpy.getRecommendedObjects.and.returnValue(
      of([
        {
          learning_object: { id: 11, title: "OA recomendado" },
          rating: 4.5,
        },
      ] as any)
    );
    learningObjectServiceSpy.getPopulars.and.returnValue(
      of([
        {
          learning_object: { id: 21, title: "OA popular" },
          rating: 5,
        },
      ] as any)
    );

    createComponent();
    flushRecommendedLoading();

    expect(learningObjectServiceSpy.getRecommendedObjects).toHaveBeenCalled();
    expect(learningObjectServiceSpy.getPopulars).toHaveBeenCalled();
    expect(component.recommended).toEqual([
      { id: 11, title: "OA recomendado", rating: 4.5 },
    ] as any);
    expect(component.populars).toEqual([
      { id: 21, title: "OA popular", rating: 5 },
    ] as any);
    expect(component.recommendedCount).toBe(1);
    expect(component.popularsCount).toBe(1);
    expect(component.loading).toBeFalse();
    expect(component.recommendedLoadFailed).toBeFalse();
    expect(component.popularsLoadFailed).toBeFalse();
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalledWith([
      { label: "ROA" },
      { label: "Recomendados", routerLink: ["/recommended"] },
    ]);
  }));

  it("no debe pedir recomendados cuando el usuario no tiene rol elegible", fakeAsync(() => {
    setRoles([]);
    learningObjectServiceSpy.getPopulars.and.returnValue(of([]));

    createComponent();
    flushRecommendedLoading();

    expect(learningObjectServiceSpy.getRecommendedObjects).not.toHaveBeenCalled();
    expect(learningObjectServiceSpy.getPopulars).toHaveBeenCalled();
    expect(component.recommended).toEqual([]);
    expect(component.populars).toEqual([]);
    expect(component.loading).toBeFalse();
  }));

  it("debe activar el fallback a populares cuando no hay recomendaciones personalizadas", fakeAsync(() => {
    setRoles(["student"]);
    learningObjectServiceSpy.getRecommendedObjects.and.returnValue(of([]));
    learningObjectServiceSpy.getPopulars.and.returnValue(
      of([{ id: 31, title: "OA destacado" }] as any)
    );

    createComponent();
    flushRecommendedLoading();

    expect(component.recommended).toEqual([]);
    expect(component.popularsCount).toBe(1);
    expect(component.showPopularsFallbackHint).toBeTrue();
  }));

  it("debe marcar error de carga cuando fallan los endpoints", fakeAsync(() => {
    setRoles(["teacher"]);
    learningObjectServiceSpy.getRecommendedObjects.and.returnValue(
      throwError(() => new Error("recommended failed"))
    );
    learningObjectServiceSpy.getPopulars.and.returnValue(
      throwError(() => new Error("populars failed"))
    );

    createComponent();
    flushRecommendedLoading();

    expect(component.recommendedLoadFailed).toBeTrue();
    expect(component.popularsLoadFailed).toBeTrue();
    expect(component.recommended).toEqual([]);
    expect(component.populars).toEqual([]);
    expect(component.loading).toBeFalse();
  }));

  it("debe usar el id del objeto en trackBy y caer al indice si no existe", fakeAsync(() => {
    setRoles([]);
    learningObjectServiceSpy.getPopulars.and.returnValue(of([]));

    createComponent();
    flushRecommendedLoading();

    expect(component.trackByObject(3, { id: 77 } as any)).toBe(77);
    expect(component.trackByObject(3, {} as any)).toBe(3);
  }));
});
