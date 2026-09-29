import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { MyObjectsComponent } from "./my-objects.component";

describe("MyObjectsComponent", () => {
  let fixture: ComponentFixture<MyObjectsComponent>;
  let component: MyObjectsComponent;
  let learningObjectServiceSpy: jasmine.SpyObj<LearningObjectService>;

  beforeEach(async () => {
    learningObjectServiceSpy = jasmine.createSpyObj("LearningObjectService", [
      "getObjectsTeacher",
    ]);
    learningObjectServiceSpy.getObjectsTeacher.and.returnValue(
      of({
        count: 4,
        pages: 2,
        links: { next: "", previous: "" },
        results: [{ id: 1 }, { id: 2 }] as any[],
      })
    );

    await TestBed.configureTestingModule({
      declarations: [MyObjectsComponent],
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
      .overrideComponent(MyObjectsComponent, {
        set: { template: "" },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MyObjectsComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar los objetos del docente al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(learningObjectServiceSpy.getObjectsTeacher).toHaveBeenCalledWith(1);
    expect(component.objects.length).toBe(2);
    expect(component.totalRecords).toBe(4);
    expect(component.rows).toBe(2);
    expect(component.currentPage).toBe(0);
    expect(component.isLoading).toBeFalse();
  });

  it("debe actualizar el paginator al cargar otra pagina", async () => {
    await component.loadData(2);

    expect(learningObjectServiceSpy.getObjectsTeacher).toHaveBeenCalledWith(2);
    expect(component.currentPage).toBe(1);
    expect(component.rows).toBe(2);
  });

  it("debe recargar el listado solo cuando la tarjeta lo solicita", () => {
    const loadDataSpy = spyOn(component, "loadData");

    component.reloadData(false);
    expect(loadDataSpy).not.toHaveBeenCalled();

    component.reloadData(true);
    expect(loadDataSpy).toHaveBeenCalled();
  });

  it("debe activar estado de error si falla la carga", async () => {
    learningObjectServiceSpy.getObjectsTeacher.and.returnValue(
      throwError(() => new Error("backend error"))
    );

    await component.loadData();

    expect(component.objects).toEqual([]);
    expect(component.loadError).toBeTrue();
    expect(component.totalRecords).toBe(0);
    expect(component.isLoading).toBeFalse();
  });
});
