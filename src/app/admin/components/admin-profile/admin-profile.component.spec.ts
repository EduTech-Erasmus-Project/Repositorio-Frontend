import { NO_ERRORS_SCHEMA } from "@angular/core";
import { fakeAsync, tick, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { of } from "rxjs";
import { MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LoginService } from "src/app/services/login.service";
import { AdminProfileComponent } from "./admin-profile.component";

describe("AdminProfileComponent", () => {
  let component: AdminProfileComponent;
  let fixture: ComponentFixture<AdminProfileComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getAdministratorUser",
      "updateAdministratorDataUser",
      "changePassword",
    ]);
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["signOut"], {
      user: { id: 14, roles: ["administrator"] },
    });
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    administratorServiceSpy.getAdministratorUser.and.returnValue(
      of({
        id: 14,
        first_name: "Ana",
        last_name: "Vera",
        email: "ana@test.com",
        administrator: {
          phone: "0991112233",
          country: "Ecuador",
          city: "Quito",
        },
      } as any)
    );
    administratorServiceSpy.updateAdministratorDataUser.and.returnValue(
      of({ message: "success" } as any)
    );
    administratorServiceSpy.changePassword.and.returnValue(
      of({ status: "Ok" } as any)
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [AdminProfileComponent],
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdminProfileComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(AdminProfileComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar el perfil del administrador autenticado", () => {
    fixture.detectChanges();

    expect(component.isReady).toBeTrue();
    expect(component.user.email).toBe("ana@test.com");
    expect(component.administrator.city).toBe("Quito");
    expect(component.getUserInitials()).toBe("AV");
  });

  it("debe normalizar y guardar los datos del perfil", fakeAsync(() => {
    fixture.detectChanges();
    component.openChangeData(component.user as any);
    component.userData.first_name = "  Ana  ";
    component.userData.last_name = "  Vera ";
    component.userData.administrator.phone = "099-111-2233";
    component.userData.administrator.country = "  Ecuador ";
    component.userData.administrator.city = " Quito ";

    component.saveData();

    expect(administratorServiceSpy.updateAdministratorDataUser).toHaveBeenCalledWith(
      jasmine.objectContaining({
        first_name: "Ana",
        last_name: "Vera",
        administrator: jasmine.objectContaining({
          phone: "0991112233",
          country: "Ecuador",
          city: "Quito",
        }),
      })
    );
    expect(component.changeDataDialog).toBeFalse();
    expect(component.submitted).toBeFalse();
    expect(component.user.first_name).toBe("Ana");
    expect(component.administrator.phone).toBe("0991112233");

    tick();

    expect(administratorServiceSpy.getAdministratorUser).toHaveBeenCalledTimes(2);
  }));

  it("debe reiniciar banderas al abrir el dialogo de cambio de contrasena", () => {
    component.formSubmit = true;
    component.showOldPassword = true;
    component.showPassword = true;
    component.showPassword2 = true;

    component.openChangePassword();

    expect(component.changePasswordDialog).toBeTrue();
    expect(component.formSubmit).toBeFalse();
    expect(component.showOldPassword).toBeFalse();
    expect(component.showPassword).toBeFalse();
    expect(component.showPassword2).toBeFalse();
  });
});
