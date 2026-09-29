import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { ManagedUserSummary } from "src/app/core/interfaces/api-contracts";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { TeacherApprovedComponent } from "./teacher-approved.component";

describe("TeacherApprovedComponent", () => {
  let component: TeacherApprovedComponent;
  let fixture: ComponentFixture<TeacherApprovedComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const teacherApprovedResponse = {
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 11,
        first_name: "Docente",
        last_name: "Aprobado",
        email: "docente@test.com",
        image_url: "https://example.com/avatar.png",
        rol_aprovados: ["teacher"],
        teacher: { id: 4, is_active: true },
        collaboratingExpert: null,
      },
    ] as ManagedUserSummary[],
  };

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getTeacherAproved",
      "updateTeacherAproved",
    ]);
    confirmationServiceSpy = jasmine.createSpyObj("ConfirmationService", ["confirm"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    administratorServiceSpy.getTeacherAproved.and.returnValue(of(teacherApprovedResponse));
    administratorServiceSpy.updateTeacherAproved.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [TeacherApprovedComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        { provide: AdminComponent, useValue: {} },
        { provide: Router, useValue: jasmine.createSpyObj("Router", ["navigate"]) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TeacherApprovedComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(TeacherApprovedComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar docentes aprobados al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getTeacherAproved).toHaveBeenCalledWith(1, "");
    expect(component.users.length).toBe(1);
    expect(component.totalRecords).toBe(1);
    expect(component.isLoading).toBeFalse();
    expect(component.canDisableTeacher(component.users[0])).toBeTrue();
  });

  it("debe confirmar y deshabilitar un docente aprobado", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await (component as any).updateApprovalStatus(11, 0, 1);

    expect(administratorServiceSpy.updateTeacherAproved).toHaveBeenCalledWith(11, 0, 1);
    expect(administratorServiceSpy.getTeacherAproved).toHaveBeenCalledTimes(2);
  });
});
