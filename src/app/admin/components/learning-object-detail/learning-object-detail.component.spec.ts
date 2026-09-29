import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { AdminComponent } from "../../admin.component";
import { LearningObjectDetailComponent } from "./learning-object-detail.component";

describe("LearningObjectDetailComponent", () => {
  let component: LearningObjectDetailComponent;
  let fixture: ComponentFixture<LearningObjectDetailComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  const routeQueryParams = { general_title: "historia", page: 3 };

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getLearningObject",
      "updatePublicandPrivateLearningObject",
    ]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    administratorServiceSpy.getLearningObject.and.returnValue(
      of({
        id: 15,
        slug: "oa-detalle",
        public: 1,
        general_title: "OA detalle",
        learning_object_file: { url: "https://example.com/index.html" },
        user_created: { id: 3, first_name: "Ana", last_name: "Perez" },
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [LearningObjectDetailComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: Router, useValue: jasmine.createSpyObj("Router", ["navigate"]) },
        { provide: ConfirmationService, useValue: jasmine.createSpyObj("ConfirmationService", ["confirm"]) },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
        { provide: LearningObjectService, useValue: jasmine.createSpyObj("LearningObjectService", ["deleteObjestTeacherAdmin"]) },
        { provide: AdminComponent, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { slug: "oa-detalle", type: "approved" },
              queryParams: routeQueryParams,
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LearningObjectDetailComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(LearningObjectDetailComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar el detalle administrativo del OA", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getLearningObject).toHaveBeenCalledWith("oa-detalle");
    expect(component.learningobjectdetail?.id).toBe(15);
    expect(component.autor?.first_name).toBe("Ana");
    expect(component.statusUpdate).toBeTrue();
    expect(component.spinner).toBeTrue();
  });

  it("debe alternar el estado de lectura extendida", () => {
    expect(component.readMore).toBeTrue();

    component.onClick();

    expect(component.readMore).toBeFalse();
  });

  it("debe conservar filtros del listado en el breadcrumb de retorno", () => {
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalledWith([
      {
        label: "Objetos de aprendizaje aprobados",
        routerLink: ["/admin/learning-object/approved"],
        queryParams: routeQueryParams,
      },
      { label: "Detalle" },
    ]);
  });
});
