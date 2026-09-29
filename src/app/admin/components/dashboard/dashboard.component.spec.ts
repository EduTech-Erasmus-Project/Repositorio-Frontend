import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdministratorService } from "src/app/services/administrator.service";
import { DashboardComponent } from "./dashboard.component";

describe("DashboardComponent", () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let routerSpy: jasmine.SpyObj<any>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getTotalLearningObjectApprovedAndDisapproved",
      "getTotalTeacherAndExpert",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    administratorServiceSpy.getTotalLearningObjectApprovedAndDisapproved.and.returnValue(
      of({ total_oa_aproved: 12, toatal_oa_disapproved: 3 } as any)
    );
    administratorServiceSpy.getTotalTeacherAndExpert.and.returnValue(
      of({
        total_expert_approved: 5,
        total_expert_disapproved: 2,
        total_teacher_approved: 7,
        total_teacher_disapproved: 1,
        total_student: 18,
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DashboardComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar los contadores del dashboard", () => {
    fixture.detectChanges();

    expect(component.isReady).toBeTrue();
    expect(component.total_oa_approved).toBe(12);
    expect(component.total_oa_disapproved).toBe(3);
    expect(component.total_expert_approved).toBe(5);
    expect(component.total_teacher_approved).toBe(7);
    expect(component.total_student).toBe(18);
  });

  it("debe reiniciar contadores cuando falla la carga", () => {
    administratorServiceSpy.getTotalTeacherAndExpert.and.returnValue(
      throwError(() => new Error("network"))
    );

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isReady).toBeTrue();
    expect(component.total_oa_approved).toBe(0);
    expect(component.total_teacher_approved).toBe(0);
    expect(component.total_student).toBe(0);
  });

  it("debe navegar al listado de expertos aprobados", () => {
    component.learningObjectToAprove(8);

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/expert/request/approved"]);
  });
});
