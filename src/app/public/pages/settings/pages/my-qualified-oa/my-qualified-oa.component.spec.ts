import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";
import { QuerySearchService } from "src/app/services/query-search.service";
import { SearchService } from "src/app/services/search.service";
import { MyQualifiedOaComponent } from "./my-qualified-oa.component";

describe("MyQualifiedOaComponent", () => {
  let fixture: ComponentFixture<MyQualifiedOaComponent>;
  let component: MyQualifiedOaComponent;
  let learningObjectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let currentRoles: string[] = [];
  const querySearchServiceStub = {
    queryParams: { general_title: "oa-test" } as any,
  };

  beforeEach(async () => {
    currentRoles = [];
    learningObjectServiceSpy = jasmine.createSpyObj("LearningObjectService", [
      "getMyObjectQualifications",
    ]);
    searchServiceSpy = jasmine.createSpyObj("SearchService", ["searchExpert"]);

    learningObjectServiceSpy.getMyObjectQualifications.and.returnValue(
      of({
        count: 1,
        pages: 1,
        links: { next: "", previous: "" },
        results: [{ id: 10 }] as any[],
      })
    );
    searchServiceSpy.searchExpert.and.returnValue(
      of({
        count: 1,
        pages: 1,
        links: { next: "", previous: "" },
        results: [{ id: 20 }] as any[],
      })
    );

    await TestBed.configureTestingModule({
      declarations: [MyQualifiedOaComponent],
      providers: [
        { provide: LearningObjectService, useValue: learningObjectServiceSpy },
        { provide: SearchService, useValue: searchServiceSpy },
        {
          provide: LoginService,
          useValue: {
            validateRole: (role: string) => currentRoles.includes(role),
          },
        },
        { provide: QuerySearchService, useValue: querySearchServiceStub },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Texto traducido")),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(MyQualifiedOaComponent, {
        set: { template: "" },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MyQualifiedOaComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar las calificaciones propias cuando el usuario es estudiante", async () => {
    currentRoles = ["student"];

    await component.loadData();

    expect(learningObjectServiceSpy.getMyObjectQualifications).toHaveBeenCalled();
    expect(searchServiceSpy.searchExpert).not.toHaveBeenCalled();
    expect(component.objects).toEqual([{ id: 10 }] as any[]);
    expect(component.loadError).toBeFalse();
  });

  it("debe buscar solo objetos evaluados cuando el usuario es experto", async () => {
    currentRoles = ["expert"];
    querySearchServiceStub.queryParams = { general_title: "oa-test" } as any;

    await component.loadData();

    expect(searchServiceSpy.searchExpert).toHaveBeenCalledWith({
      general_title: "oa-test",
      is_evaluated: "True",
    } as any);
    expect(querySearchServiceStub.queryParams.is_evaluated).toBeUndefined();
    expect(component.objects).toEqual([{ id: 20 }] as any[]);
  });

  it("debe activar estado de error cuando falla la carga del estudiante", async () => {
    currentRoles = ["student"];
    learningObjectServiceSpy.getMyObjectQualifications.and.returnValue(
      throwError(() => new Error("student error"))
    );

    await component.loadData();

    expect(component.objects).toEqual([]);
    expect(component.loadError).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });
});
