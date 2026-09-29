import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { StudentViewedComponent } from "./student-viewed.component";

describe("StudentViewedComponent", () => {
  let fixture: ComponentFixture<StudentViewedComponent>;
  let component: StudentViewedComponent;
  let learningObjectServiceSpy: jasmine.SpyObj<LearningObjectService>;

  beforeEach(async () => {
    learningObjectServiceSpy = jasmine.createSpyObj("LearningObjectService", [
      "getObjectsViewed",
    ]);

    await TestBed.configureTestingModule({
      declarations: [StudentViewedComponent],
      providers: [
        { provide: LearningObjectService, useValue: learningObjectServiceSpy },
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
      .overrideComponent(StudentViewedComponent, {
        set: { template: "" },
      })
      .compileComponents();

    fixture = TestBed.createComponent(StudentViewedComponent);
    component = fixture.componentInstance;
  });

  it("debe mapear la respuesta paginada del historial de vistos", async () => {
    learningObjectServiceSpy.getObjectsViewed.and.returnValue(
      of({
        count: 1,
        pages: 1,
        links: { next: "", previous: "" },
        results: [
          {
            learning_object: { id: 5, general_title: "OA visto" },
            rating: 4.5,
          },
        ],
      } as any)
    );

    await component.loadData();

    expect(component.objects).toEqual([
      {
        id: 5,
        general_title: "OA visto",
        rating: 4.5,
      },
    ] as any);
    expect(component.loadError).toBeFalse();
  });

  it("debe mapear tambien una respuesta legacy en lista plana", async () => {
    learningObjectServiceSpy.getObjectsViewed.and.returnValue(
      of([
        {
          learning_object: { id: 9, general_title: "OA plano" },
          rating: 3,
        },
      ] as any)
    );

    await component.loadData();

    expect(component.objects).toEqual([
      {
        id: 9,
        general_title: "OA plano",
        rating: 3,
      },
    ] as any);
  });

  it("debe activar estado de error cuando falla la carga", async () => {
    learningObjectServiceSpy.getObjectsViewed.and.returnValue(
      throwError(() => new Error("viewed error"))
    );

    await component.loadData();

    expect(component.objects).toEqual([]);
    expect(component.loadError).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });
});
