import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdministratorUserRegisterComponent } from "./administrator-user-register.component";

describe("AdministratorUserRegisterComponent", () => {
  let component: AdministratorUserRegisterComponent;
  let fixture: ComponentFixture<AdministratorUserRegisterComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", ["registerAdministratorUser"]);
    administratorServiceSpy.registerAdministratorUser.and.returnValue(of({ id: 1 } as any));
    spyOn(Swal, "fire").and.resolveTo({} as any);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AdministratorUserRegisterComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdministratorUserRegisterComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(AdministratorUserRegisterComponent);
    component = fixture.componentInstance;
  });

  it("debe normalizar el telefono a solo 10 digitos", () => {
    component.registerForm.get("phone")?.setValue("099-111-22334");

    component.normalizePhoneInput();

    expect(component.registerForm.get("phone")?.value).toBe("0991112233");
  });

  it("no debe registrar si el formulario es invalido", () => {
    component.crearUsuario();

    expect(administratorServiceSpy.registerAdministratorUser).not.toHaveBeenCalled();
  });

  it("debe registrar y reiniciar el formulario cuando el alta es exitosa", () => {
    component.registerForm.patchValue({
      first_name: "Ana",
      last_name: "Admin",
      email: "ana.admin@test.com",
      password: "Segura123",
      password2: "Segura123",
      country: "Ecuador",
      city: "Quito",
      phone: "0991112233",
    });

    component.crearUsuario();

    expect(administratorServiceSpy.registerAdministratorUser).toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
    expect(component.formSubmit).toBeFalse();
    expect(Swal.fire).toHaveBeenCalled();
  });
});
