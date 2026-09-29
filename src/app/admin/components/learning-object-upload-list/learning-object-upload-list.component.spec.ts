import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LearningObjectUploadListComponent } from "./learning-object-upload-list.component";

describe("LearningObjectUploadListComponent", () => {
  let component: LearningObjectUploadListComponent;
  let fixture: ComponentFixture<LearningObjectUploadListComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "listLearningObjectUploadByTeacher",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    administratorServiceSpy.listLearningObjectUploadByTeacher.and.returnValue(
      of({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 4, slug: "oa-cargado" }] as any[],
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [LearningObjectUploadListComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: "12" } } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LearningObjectUploadListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(LearningObjectUploadListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar objetos cargados por docente al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.listLearningObjectUploadByTeacher).toHaveBeenCalledWith(12);
    expect(component.learningobjects.length).toBe(1);
    expect(component.hasLoaded).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  it("debe navegar al detalle de un OA cargado", () => {
    component.getLearningObjectDetail("oa-cargado");

    expect(routerSpy.navigate).toHaveBeenCalledWith([
      "/admin/teacher/request/approved/learning-object/upload/detail/oa-cargado",
    ]);
  });
});
