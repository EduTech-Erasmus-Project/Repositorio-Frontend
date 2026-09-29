import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, UntypedFormBuilder } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { SecurityComponent } from "./security.component";

@Pipe({
    name: "translate",
    standalone: false
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("SecurityComponent", () => {
  let fixture: ComponentFixture<SecurityComponent>;
  let component: SecurityComponent;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  const instantTranslations: Record<string, string> = {
    "message.titleError": "Error",
    "message.titleSuccess": "Success",
    "security.passwordsDoNotMatch": "La contraseñas no coinciden",
    "security.passwordUpdated": "Contraseña actualizada",
    "security.updatingPassword": "Actualizando su contraseña...",
    "security.samePasswordError": "La nueva contraseña no puede ser la misma que la anterior.",
    "security.newPasswordMismatch": "La contraseña nueva no coincide",
    "security.currentPasswordIncorrect": "La contraseña actual es incorrecta",
  };

  beforeEach(async () => {
    loginServiceSpy = jasmine.createSpyObj(
      "LoginService",
      ["changePassword", "signOutPass"],
      {
        user: { id: 25 },
      }
    );
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SecurityComponent, TranslatePipeMock],
      providers: [
        UntypedFormBuilder,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Texto traducido")),
              instant: jasmine
                .createSpy("instant")
                .and.callFake((key: string) => instantTranslations[key] || ""),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    spyOn(Swal, "fire");
    spyOn(Swal, "showLoading");
    spyOn(Swal, "close");

    fixture = TestBed.createComponent(SecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("debe iniciar con el campo de confirmacion deshabilitado", () => {
    expect(component.angForm.get("passwordAgain")?.disabled).toBeTrue();
  });

  it("debe habilitar y deshabilitar el campo de confirmacion segun la nueva contraseña", () => {
    component.angForm.get("passwordNew")?.setValue("Password1");
    component.enabled_Password();

    expect(component.angForm.get("passwordAgain")?.enabled).toBeTrue();

    component.angForm.get("passwordNew")?.setValue("");
    component.enabled_Password();

    expect(component.angForm.get("passwordAgain")?.disabled).toBeTrue();
  });

  it("debe validar correctamente cuando las contraseñas coinciden", () => {
    component.angForm.get("passwordAgain")?.enable();
    component.angForm.patchValue({
      passwordNew: "Password1",
      passwordAgain: "Password1",
    });

    const result = component.validatorPassword();

    expect(result).toBeFalse();
    expect(component.flagConfirm).toBeTrue();
    expect(component.passsword_invalid).toBeFalse();
  });

  it("debe marcar el formulario como tocado cuando se envia invalido", async () => {
    await component.sendPasswordRest();

    expect(component.passwordOld?.touched).toBeTrue();
    expect(component.passwordNew?.touched).toBeTrue();
    expect(component.passwordAgain?.touched).toBeTrue();
    expect(loginServiceSpy.changePassword).not.toHaveBeenCalled();
  });

  it("debe mostrar error y no enviar si las contraseñas nuevas no coinciden", async () => {
    component.angForm.get("passwordAgain")?.enable();
    component.angForm.patchValue({
      passwordOld: "Anterior1",
      passwordNew: "Nueva123",
      passwordAgain: "Otra1234",
    });

    await component.sendPasswordRest();

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "La contraseñas no coinciden",
    });
    expect(loginServiceSpy.changePassword).not.toHaveBeenCalled();
  });

  it("debe cambiar la contraseña y cerrar sesion cuando el backend responde Ok", async () => {
    loginServiceSpy.changePassword.and.returnValue(of({ status: "Ok" }));
    component.angForm.get("passwordAgain")?.enable();
    component.angForm.patchValue({
      passwordOld: "Anterior1",
      passwordNew: "Nueva123",
      passwordAgain: "Nueva123",
    });

    await component.sendPasswordRest();

    const [payload, userId] = loginServiceSpy.changePassword.calls.mostRecent()
      .args as any[];

    expect(payload).toEqual({
      password: "Nueva123",
      password2: "Nueva123",
      old_password: "Anterior1",
    });
    expect(userId).toBe(25);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "success",
      summary: "Success",
      detail: "Contraseña actualizada",
    });
    expect(loginServiceSpy.signOutPass).toHaveBeenCalled();
    expect(Swal.close).toHaveBeenCalled();
  });

  it("debe mostrar error cuando la nueva contraseña es igual a la anterior", async () => {
    loginServiceSpy.changePassword.and.returnValue(
      throwError({
        error: {
          details: {
            password: ["New password cannot be the same as above."],
          },
        },
      })
    );
    component.angForm.get("passwordAgain")?.enable();
    component.angForm.patchValue({
      passwordOld: "Anterior1",
      passwordNew: "Anterior1",
      passwordAgain: "Anterior1",
    });

    await component.sendPasswordRest();

    expect(component.passsword_invalid).toBeTrue();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "La nueva contraseña no puede ser la misma que la anterior.",
    });
  });

  it("debe mostrar el formulario al pulsar el boton de cambio de contraseña", () => {
    expect(fixture.nativeElement.querySelector("#passwordOldInput")).toBeNull();

    const toggleButton = fixture.nativeElement.querySelector(".security-page__toggle");
    expect(toggleButton).toBeTruthy();

    toggleButton.click();
    fixture.detectChanges();

    expect(component.show).toBeTrue();
    expect(fixture.nativeElement.querySelector("#passwordOldInput")).toBeTruthy();
    expect(fixture.nativeElement.querySelector("#passwordNew")).toBeTruthy();
    expect(fixture.nativeElement.querySelector("#passwordNewAgain")).toBeTruthy();
  });

  it("debe enviar el formulario real cuando el usuario completa correctamente los campos", async () => {
    loginServiceSpy.changePassword.and.returnValue(of({ status: "Ok" }));

    const toggleButton = fixture.nativeElement.querySelector(".security-page__toggle");
    expect(toggleButton).toBeTruthy();

    toggleButton.click();
    fixture.detectChanges();

    const oldInput = fixture.nativeElement.querySelector("#passwordOldInput");
    const newInput = fixture.nativeElement.querySelector("#passwordNew");
    const againInput = fixture.nativeElement.querySelector("#passwordNewAgain");

    oldInput.value = "Anterior1";
    oldInput.dispatchEvent(new Event("input"));

    newInput.value = "Nueva123";
    newInput.dispatchEvent(new Event("input"));
    newInput.dispatchEvent(new KeyboardEvent("keypress"));
    fixture.detectChanges();

    expect(component.angForm.get("passwordAgain")?.enabled).toBeTrue();

    againInput.value = "Nueva123";
    againInput.dispatchEvent(new Event("input"));
    againInput.dispatchEvent(new KeyboardEvent("keyup"));
    fixture.detectChanges();

    fixture.debugElement
      .query(By.css("#loginForm"))
      .triggerEventHandler("ngSubmit", {});
    fixture.detectChanges();
    await fixture.whenStable();

    const [payload, userId] = loginServiceSpy.changePassword.calls.mostRecent()
      .args as any[];

    expect(payload).toEqual({
      password: "Nueva123",
      password2: "Nueva123",
      old_password: "Anterior1",
    });
    expect(userId).toBe(25);
    expect(loginServiceSpy.signOutPass).toHaveBeenCalled();
  });
});
