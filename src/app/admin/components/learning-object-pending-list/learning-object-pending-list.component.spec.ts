import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { AdminComponent } from "../../admin.component";
import { LearningObjectPendingListComponent } from "./learning-object-pending-list.component";

describe("LearningObjectPendingListComponent", () => {
  let component: LearningObjectPendingListComponent;
  let fixture: ComponentFixture<LearningObjectPendingListComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let routerSpy: jasmine.SpyObj<Router>;
  const routeQueryParams = { general_title: "biologia", page: 2 };

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "listLearningObject",
      "updatePublicandPrivateLearningObject",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl", "parseUrl"], {
      url: "/admin/learning-object/pending?general_title=biologia&page=2",
    });

    administratorServiceSpy.listLearningObject.and.returnValue(
      of({
        count: 12,
        next: null,
        previous: null,
        results: [{ id: 9, slug: "oa-pendiente", public: 0 }] as any[],
      } as any)
    );
    routerSpy.parseUrl.and.callFake((url: string) => ({
      queryParams: { ...routeQueryParams },
      toString: () => url,
    } as any));
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      declarations: [LearningObjectPendingListComponent],
      providers: [
        FormBuilder,
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: ConfirmationService, useValue: jasmine.createSpyObj("ConfirmationService", ["confirm"]) },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: LearningObjectService, useValue: jasmine.createSpyObj("LearningObjectService", ["deleteObjestTeacherAdmin"]) },
        { provide: AdminComponent, useValue: {} },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: routeQueryParams } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LearningObjectPendingListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(LearningObjectPendingListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar objetos pendientes al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.listLearningObject).toHaveBeenCalled();
    expect(component.learningobjectList.length).toBe(1);
    expect(component.totalRecords).toBe(12);
    expect(component.hasLoaded).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  it("debe mantener un tamano de pagina estable al rehidratar desde una pagina parcial", async () => {
    administratorServiceSpy.listLearningObject.and.returnValue(
      of({
        count: 17,
        next: null,
        previous: null,
        results: [{ id: 10, slug: "oa-parcial", public: 0 }] as any[],
      } as any)
    );

    await component.loadLearningObjects();

    expect(component.pageSize).toBe(10);
    expect(component.first).toBe(10);
    expect(component.totalRecords).toBe(17);
  });

  it("debe navegar al detalle pendiente", () => {
    component.getDetail("oa-pendiente");

    expect(routerSpy.navigate).toHaveBeenCalledWith([
      "/admin/learning-object/pending/detail/oa-pendiente",
    ], { queryParams: routeQueryParams });
    expect(
      sessionStorage.getItem(
        "admin:learning-object:pending:scroll:/admin/learning-object/pending?general_title=biologia&page=2"
      )
    ).not.toBeNull();
  });
});
