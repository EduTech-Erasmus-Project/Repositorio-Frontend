import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { ManagedUserSummary } from "src/app/core/interfaces/api-contracts";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { ExpertApprovedComponent } from "./expert-approved.component";

describe("ExpertApprovedComponent", () => {
  let component: ExpertApprovedComponent;
  let fixture: ComponentFixture<ExpertApprovedComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const expertApprovedResponse = {
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 31,
        first_name: "Experto",
        last_name: "Aprobado",
        email: "experto@test.com",
        rol_aprovados: ["expert"],
        teacher: { id: 9, is_active: true },
        collaboratingExpert: { id: 12, is_active: true },
      },
    ] as ManagedUserSummary[],
  };

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getExpertAproved",
      "updateCollaboratingExpertAproved",
    ]);
    confirmationServiceSpy = jasmine.createSpyObj("ConfirmationService", ["confirm"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    administratorServiceSpy.getExpertAproved.and.returnValue(of(expertApprovedResponse));
    administratorServiceSpy.updateCollaboratingExpertAproved.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [ExpertApprovedComponent],
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
      .overrideComponent(ExpertApprovedComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(ExpertApprovedComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar expertos aprobados al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getExpertAproved).toHaveBeenCalledWith(1, "");
    expect(component.users.length).toBe(1);
    expect(component.canDisableExpert(component.users[0])).toBeTrue();
    expect(component.canDisableTeacher(component.users[0])).toBeTrue();
  });

  it("debe deshabilitar un rol aprobado y recargar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await (component as any).updateApprovalStatus(31, 1, 0);

    expect(administratorServiceSpy.updateCollaboratingExpertAproved).toHaveBeenCalledWith(
      31,
      1,
      0
    );
    expect(administratorServiceSpy.getExpertAproved).toHaveBeenCalledTimes(2);
  });
});
