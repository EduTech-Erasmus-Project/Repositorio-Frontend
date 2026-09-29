import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { ManagedUserSummary } from "src/app/core/interfaces/api-contracts";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { ExpertPendingComponent } from "./expert-pending.component";

describe("ExpertPendingComponent", () => {
  let component: ExpertPendingComponent;
  let fixture: ComponentFixture<ExpertPendingComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const expertPendingResponse = {
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 41,
        first_name: "Experto",
        last_name: "Pendiente",
        email: "experto-pendiente@test.com",
        rol_solicitados: ["expert"],
        teacher: null,
        collaboratingExpert: { id: 14, is_active: false },
      },
    ] as ManagedUserSummary[],
  };

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getExpertToAprove",
      "updateCollaboratingExpertToAprove",
      "deleteUserExpert",
    ]);
    confirmationServiceSpy = jasmine.createSpyObj("ConfirmationService", ["confirm"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    administratorServiceSpy.getExpertToAprove.and.returnValue(of(expertPendingResponse));
    administratorServiceSpy.updateCollaboratingExpertToAprove.and.returnValue(of({}));
    administratorServiceSpy.deleteUserExpert.and.returnValue(of({ code: 200 }));

    await TestBed.configureTestingModule({
      declarations: [ExpertPendingComponent],
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
      .overrideComponent(ExpertPendingComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(ExpertPendingComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar expertos pendientes al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getExpertToAprove).toHaveBeenCalledWith(1, "");
    expect(component.users.length).toBe(1);
    expect(component.canApproveExpert(component.users[0])).toBeTrue();
  });

  it("debe aprobar una solicitud de experto", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await (component as any).updatePendingStatus(41, 0, 1);

    expect(administratorServiceSpy.updateCollaboratingExpertToAprove).toHaveBeenCalledWith(
      41,
      0,
      1
    );
    expect(administratorServiceSpy.getExpertToAprove).toHaveBeenCalledTimes(2);
  });

  it("debe eliminar una solicitud de experto y recargar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await (component as any).deletePendingExpert(41);

    expect(administratorServiceSpy.deleteUserExpert).toHaveBeenCalledWith(41);
    expect(administratorServiceSpy.getExpertToAprove).toHaveBeenCalledTimes(2);
  });
});
