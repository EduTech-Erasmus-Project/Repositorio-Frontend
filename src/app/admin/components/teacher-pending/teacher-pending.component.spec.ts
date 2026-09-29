import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { ManagedUserSummary } from "src/app/core/interfaces/api-contracts";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { TeacherPendingComponent } from "./teacher-pending.component";

describe("TeacherPendingComponent", () => {
  let component: TeacherPendingComponent;
  let fixture: ComponentFixture<TeacherPendingComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const teacherPendingResponse = {
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 21,
        first_name: "Docente",
        last_name: "Pendiente",
        email: "pendiente@test.com",
        rol_solicitados: ["teacher"],
        teacher: { id: 8, is_active: false },
        collaboratingExpert: null,
      },
    ] as ManagedUserSummary[],
  };

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getTeacherToAprove",
      "updateTeacherToAprove",
      "deleteUserTeacher",
    ]);
    confirmationServiceSpy = jasmine.createSpyObj("ConfirmationService", ["confirm"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    administratorServiceSpy.getTeacherToAprove.and.returnValue(of(teacherPendingResponse));
    administratorServiceSpy.updateTeacherToAprove.and.returnValue(of({}));
    administratorServiceSpy.deleteUserTeacher.and.returnValue(of({ code: 200 }));

    await TestBed.configureTestingModule({
      declarations: [TeacherPendingComponent],
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
      .overrideComponent(TeacherPendingComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(TeacherPendingComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar docentes pendientes al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getTeacherToAprove).toHaveBeenCalledWith(1, "");
    expect(component.users.length).toBe(1);
    expect(component.canApproveTeacher(component.users[0])).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  it("debe aprobar una solicitud pendiente", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await (component as any).updatePendingStatus(21, 1, 0);

    expect(administratorServiceSpy.updateTeacherToAprove).toHaveBeenCalledWith(21, 1, 0);
    expect(administratorServiceSpy.getTeacherToAprove).toHaveBeenCalledTimes(2);
  });

  it("debe eliminar una solicitud pendiente y recargar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await (component as any).deletePendingTeacher(21);

    expect(administratorServiceSpy.deleteUserTeacher).toHaveBeenCalledWith(21);
    expect(administratorServiceSpy.getTeacherToAprove).toHaveBeenCalledTimes(2);
  });
});
