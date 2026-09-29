import { NO_ERRORS_SCHEMA } from "@angular/core";
import { fakeAsync, ComponentFixture, TestBed, tick } from "@angular/core/testing";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { UserService } from "../../services/user.service";
import { AdministratorUserListComponent } from "./administrator-user-list.component";

describe("AdministratorUserListComponent", () => {
  let component: AdministratorUserListComponent;
  let fixture: ComponentFixture<AdministratorUserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj("UserService", ["listAdministratorUser"]);
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", ["updateAdministratorUser"]);
    confirmationServiceSpy = jasmine.createSpyObj("ConfirmationService", ["confirm"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    userServiceSpy.listAdministratorUser.and.returnValue(
      of([
        {
          id: 10,
          first_name: "Admin",
          last_name: "Uno",
          administrator: {
            administrator_is_active: true,
            city: "Quito",
            country: "Ecuador",
          },
        },
      ] as any)
    );
    administratorServiceSpy.updateAdministratorUser.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      declarations: [AdministratorUserListComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AdministratorService, useValue: administratorServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdministratorUserListComponent, {
        set: {
          template: "",
          providers: [
            { provide: ConfirmationService, useValue: confirmationServiceSpy },
            { provide: MessageService, useValue: messageServiceSpy },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdministratorUserListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar administradores en la tabla", () => {
    fixture.detectChanges();

    expect(component.isReady).toBeTrue();
    expect(component.administratorUsers.length).toBe(1);
    expect(component.isAdministratorActive(component.administratorUsers[0])).toBeTrue();
  });

  it("debe soportar el flag legacy is_active", () => {
    expect(
      component.isAdministratorActive({
        administrator: { is_active: true } as any,
      } as any)
    ).toBeTrue();
  });

  it("debe deshabilitar un administrador tras confirmar", fakeAsync(() => {
    fixture.detectChanges();

    component.disable({ target: document.createElement("button") } as any, 10);
    const confirmConfig = confirmationServiceSpy.confirm.calls.mostRecent().args[0] as any;
    confirmConfig.accept();
    tick(600);

    expect(administratorServiceSpy.updateAdministratorUser).toHaveBeenCalledWith(10, 0);
    expect(messageServiceSpy.add).toHaveBeenCalled();
    expect(userServiceSpy.listAdministratorUser).toHaveBeenCalledTimes(2);
  }));
});
