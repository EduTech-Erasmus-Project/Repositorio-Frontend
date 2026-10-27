import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of, Subject, throwError } from "rxjs";
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

  it("no debe borrar lo que el usuario sigue escribiendo mientras llega la busqueda", async () => {
    const pending = new Subject<typeof teacherApprovedResponse>();
    administratorServiceSpy.getTeacherAproved.and.returnValue(pending);

    component.onSearchInput("ana");
    const load = component.loadApprovedTeachers(1, "ana");
    component.onSearchInput("ana mar ");
    pending.next(teacherApprovedResponse);
    pending.complete();
    await load;

    expect(component.searchTerm).toBe("ana mar ");
  });

  it("debe ignorar una respuesta vieja que llega despues de la ultima", async () => {
    const slow = new Subject<typeof teacherApprovedResponse>();
    const fast = new Subject<typeof teacherApprovedResponse>();
    administratorServiceSpy.getTeacherAproved.and.returnValues(slow, fast);
    const latest = { ...teacherApprovedResponse, results: [{ ...teacherApprovedResponse.results[0], id: 99 }] };

    const first = component.loadApprovedTeachers(1, "a");
    const second = component.loadApprovedTeachers(1, "ana");
    fast.next(latest);
    fast.complete();
    await second;
    slow.next(teacherApprovedResponse);
    slow.complete();
    await first;

    expect(component.users.map((user) => user.id)).toEqual([99]);
  });

  it("debe volver a la pagina anterior si la pedida ya no existe", async () => {
    administratorServiceSpy.getTeacherAproved.and.returnValues(
      throwError(() => ({ status: 404 })),
      of(teacherApprovedResponse)
    );

    await component.paginate({ page: 1, first: 10 });

    expect(administratorServiceSpy.getTeacherAproved.calls.allArgs()).toEqual([[2, ""], [1, ""]]);
    expect(component.first).toBe(0);
    expect(component.users.length).toBe(1);
    expect(messageServiceSpy.add).not.toHaveBeenCalled();
  });
});
