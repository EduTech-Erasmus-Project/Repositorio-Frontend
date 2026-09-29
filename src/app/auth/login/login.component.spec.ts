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
      detail: "Credenciales invalidas",
    });
    expect(component.loginErrorMessage).toBe("Credenciales invalidas");
    expect(Swal.close).toHaveBeenCalled();
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
