import { CommonModule } from "@angular/common";
import { Component, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, UntypedFormBuilder } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of, Subject, throwError } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { LanguageService } from "../../services/language.service";
import { LoginService } from "../../services/login.service";
import { StorageService } from "../../services/storage.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { UserService } from "src/app/services/user.service";
import { LoginComponent } from "./login.component";

@Pipe({
    name: "translate",
    standalone: false
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Component({
    selector: "p-toast",
    template: "",
    standalone: false
})
class PToastStubComponent {}

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translateMock: any;

  beforeEach(async () => {
    translateMock = {
      currentLang: "es",
      translations: {
        es: {
          login: {
            modalMsj: "Cargando",
            errorMesage: "Credenciales invalidas",
            isNotActiveAccountMessageSummary: "Cuenta inactiva",
            isNotActiveAccountMessage: "Se reenvio el correo",
            errorNotVerified: "Verifica tu correo",
            errorPendingApproval: "Cuenta pendiente de aprobacion",
            errorServer: "Sin conexion con el servidor",
            errorGeneric: "Error al iniciar sesion",
          },
          message: {
            titleError: "Error",
          },
        },
        en: {
          login: {
            modalMsj: "Loading",
            errorMesage: "Invalid credentials",
            isNotActiveAccountMessageSummary: "Inactive account",
            isNotActiveAccountMessage: "Email resent",
            errorNotVerified: "Verify your email",
            errorPendingApproval: "Account pending approval",
            errorServer: "Cannot reach the server",
            errorGeneric: "Sign in error",
          },
          message: {
            titleError: "Error",
          },
        },
      },
      onLangChange: new Subject<any>(),
      get: jasmine.createSpy("get").and.returnValue(of("Iniciar sesion")),
    };

    loginServiceSpy = jasmine.createSpyObj(
      "LoginService",
      ["signIn", "validateUser", "setCharacterMenuState", "initializeCsrfSession"],
      {
        user: null,
      }
    );
    loginServiceSpy.initializeCsrfSession.and.returnValue(of(null));
    storageServiceSpy = jasmine.createSpyObj("StorageService", [
      "getLocalItem",
      "saveLocalItem",
      "removeLocalItem",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add", "clear"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", [
      "setItems",
    ]);
    userServiceSpy = jasmine.createSpyObj("UserService", [
      "set_email_verify_new_token",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    storageServiceSpy.getLocalItem.and.callFake((key: string) => {
      if (key === "userEmail") {
        return null as any;
      }
      return null as any;
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        InputTextModule,
        PasswordModule,
        CheckboxModule,
        ButtonModule,
      ],
      declarations: [
        LoginComponent,
        TranslatePipeMock,
        PToastStubComponent,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: LanguageService, useValue: { translate: translateMock } },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    spyOn(Swal, "fire");
    spyOn(Swal, "showLoading");
    spyOn(Swal, "close");

    fixture.detectChanges();
  });

  function submitForm() {
    fixture.debugElement.query(By.css("#loginForm")).triggerEventHandler(
      "ngSubmit",
      {}
    );
    fixture.detectChanges();
  }

  it("debe marcar el formulario como tocado cuando se envia invalido", () => {
    submitForm();

    expect(component.loginForm.get("email")?.touched).toBeTrue();
    expect(component.loginForm.get("password")?.touched).toBeTrue();
    expect(loginServiceSpy.signIn).not.toHaveBeenCalled();
    expect(messageServiceSpy.clear).toHaveBeenCalled();
  });

  it("debe mostrar un enlace claro hacia el registro", () => {
    const registerLink = fixture.debugElement.query(
      By.css(".login-register-link .secondary-button")
    );

    expect(registerLink).toBeTruthy();
    expect(registerLink.nativeElement.getAttribute("href")).toBe("#/register");
  });

  it("debe iniciar sesion y rehidratar la sesion por cookie cuando el formulario es valido", async () => {
    loginServiceSpy.signIn.and.returnValue(
      of({ access: "token-access", refresh: "token-refresh" })
    );
    loginServiceSpy.validateUser.and.callFake(() => {
      Object.defineProperty(loginServiceSpy, "user", {
        value: { roles: ["teacher"] },
        configurable: true,
      });
      return Promise.resolve(true);
    });

    component.loginForm.patchValue({
      email: "docente@ups.edu.ec",
      password: "123456",
      rememberMe: true,
    });

    await component.onLogin();
    await fixture.whenStable();

    expect(loginServiceSpy.signIn).toHaveBeenCalledWith({
      email: "docente@ups.edu.ec",
      password: "123456",
    });
    expect(storageServiceSpy.saveLocalItem).toHaveBeenCalledWith(
      "userEmail",
      "docente@ups.edu.ec"
    );
    expect(loginServiceSpy.validateUser).toHaveBeenCalledWith();
    expect(loginServiceSpy.setCharacterMenuState).toHaveBeenCalledWith(true);
    expect(Swal.close).toHaveBeenCalled();
  });

  it("debe mostrar el estado de cuenta inactiva cuando el backend rechaza el login", async () => {
    loginServiceSpy.signIn.and.returnValue(
      throwError({
        error: {
          detail: "Account inactive user",
        },
      })
    );

    component.loginForm.patchValue({
      email: "usuario@ups.edu.ec",
      password: "123456",
      rememberMe: false,
    });

    await component.onLogin();
    await fixture.whenStable();

    expect(component.isNotaccountaActive).toBeTrue();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "Verifica tu correo",
    });
    expect(component.loginErrorMessage).toBe("Verifica tu correo");
    expect(Swal.close).toHaveBeenCalled();
  });

  describe("errores del backend al iniciar sesion", () => {
    async function loginWithError(httpError: unknown) {
      loginServiceSpy.signIn.and.returnValue(throwError(() => httpError));

      component.loginForm.patchValue({
        email: "usuario@ups.edu.ec",
        password: "123456",
        rememberMe: false,
      });

      await component.onLogin();
      await fixture.whenStable();
    }

    it("debe pedir verificar el correo y mostrar el boton de reenvio con code account_not_verified", async () => {
      await loginWithError({
        status: 403,
        error: { detail: "Account inactive user", code: "account_not_verified" },
      });

      expect(component.isNotaccountaActive).toBeTrue();
      expect(component.loginErrorMessage).toBe("Verifica tu correo");
    });

    it("debe indicar cuenta pendiente de aprobacion con code account_pending_approval", async () => {
      await loginWithError({
        status: 403,
        error: { detail: "Inactive user", code: "account_pending_approval" },
      });

      expect(component.isNotaccountaActive).toBeFalse();
      expect(component.loginErrorMessage).toBe("Cuenta pendiente de aprobacion");
    });

    it("debe indicar cuenta pendiente con el backend anterior (500 sin code)", async () => {
      await loginWithError({ status: 500, error: { detail: "Inactive user" } });

      expect(component.isNotaccountaActive).toBeFalse();
      expect(component.loginErrorMessage).toBe("Cuenta pendiente de aprobacion");
    });

    it("debe pedir verificar el correo con el backend anterior (500 sin code)", async () => {
      await loginWithError({ status: 500, error: { detail: "Account inactive user" } });

      expect(component.isNotaccountaActive).toBeTrue();
      expect(component.loginErrorMessage).toBe("Verifica tu correo");
    });

    it("debe mostrar credenciales invalidas con 401", async () => {
      await loginWithError({
        status: 401,
        error: {
          detail: "No active account found with the given credentials",
          code: "no_active_account",
        },
      });

      expect(component.isNotaccountaActive).toBeFalse();
      expect(component.loginErrorMessage).toBe("Credenciales invalidas");
    });

    it("debe indicar que no hay conexion con status 0", async () => {
      await loginWithError({ status: 0, error: null });

      expect(component.loginErrorMessage).toBe("Sin conexion con el servidor");
    });

    it("debe indicar que no hay conexion con un 500 real", async () => {
      await loginWithError({ status: 502, error: null });

      expect(component.loginErrorMessage).toBe("Sin conexion con el servidor");
    });

    it("debe mostrar un error generico para otros status", async () => {
      await loginWithError({ status: 400, error: { detail: "Bad request" } });

      expect(component.isNotaccountaActive).toBeFalse();
      expect(component.loginErrorMessage).toBe("Error al iniciar sesion");
    });

    it("debe mostrar el mensaje en el idioma actual", async () => {
      translateMock.currentLang = "en";

      await loginWithError({
        status: 403,
        error: { detail: "Inactive user", code: "account_pending_approval" },
      });

      expect(component.loginErrorMessage).toBe("Account pending approval");
    });

    it("no debe mostrar nunca el detail del backend al usuario", async () => {
      await loginWithError({
        status: 401,
        error: {
          detail: "No active account found with the given credentials",
          code: "no_active_account",
        },
      });

      expect(component.loginErrorMessage).not.toContain("No active account");
    });
  });

  it("debe emitir la actualizacion de menu al iniciar sesion como experto", async () => {
    loginServiceSpy.signIn.and.returnValue(
      of({ access: "token-access", refresh: "token-refresh" })
    );
    loginServiceSpy.validateUser.and.callFake(() => {
      Object.defineProperty(loginServiceSpy, "user", {
        value: { roles: ["expert"] },
        configurable: true,
      });
      return Promise.resolve(true);
    });

    component.loginForm.patchValue({
      email: "experto@ups.edu.ec",
      password: "123456",
      rememberMe: true,
    });

    await component.onLogin();
    await fixture.whenStable();

    expect(loginServiceSpy.setCharacterMenuState).toHaveBeenCalledWith(true);
  });
});
