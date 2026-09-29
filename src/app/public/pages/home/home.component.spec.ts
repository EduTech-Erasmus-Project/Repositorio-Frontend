import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { HomeComponent } from "./home.component";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let objectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    objectServiceSpy = jasmine.createSpyObj("LearningObjectService", [
      "getPopulars",
      "getMostPopulars",
      "getMostRecent",
    ]);
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["validateRole"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    objectServiceSpy.getPopulars.and.returnValue(
      of([{ learning_object: { id: 1, general_title: "Popular" }, rating: 4.8 }] as any)
    );
    objectServiceSpy.getMostPopulars.and.returnValue(
      of([{ id: 2, general_title: "Liked", rating: 4.9 }] as any)
    );
    objectServiceSpy.getMostRecent.and.returnValue(
      of([{ id: 3, general_title: "Recent", rating: 4.6 }] as any)
    );
    loginServiceSpy.validateRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LearningObjectService, useValue: objectServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Home")),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(HomeComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("carga los tres carriles de descubrimiento y publica el breadcrumb", () => {
    expect(component.populars).toEqual([
      { id: 1, general_title: "Popular", rating: 4.8 },
    ] as any);
    expect(component.mostLiked).toEqual([
      { id: 2, general_title: "Liked", rating: 4.9 },
    ] as any);
    expect(component.mostRecent).toEqual([
      { id: 3, general_title: "Recent", rating: 4.6 },
    ] as any);
    expect(component.loading).toBeFalse();
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalledWith([
      { label: "ROA" },
      { label: "Home", routerLink: ["/"] },
    ]);
  });

  it("redirige a recommended cuando se navega desde la seccion correspondiente", () => {
    component.onNavegateTo("recommended");

    expect(routerSpy.navigate).toHaveBeenCalledWith(["recommended"]);
  });

  it("redirige a search con query params segun el filtro rapido elegido", () => {
    component.sendParameters("recent");

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/search"], {
      queryParams: { recent: "True" },
    });
  });
});
