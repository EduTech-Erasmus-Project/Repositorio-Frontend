import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { UserService } from "src/app/services/user.service";
import { VerifyEmailComponent } from "./verify-email.component";

describe("VerifyEmailComponent", () => {
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let component: VerifyEmailComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routeParams: { email: string; token: string };

  beforeEach(async () => {
    routeParams = {
      email: btoa("usuario@ups.edu.ec"),
      token: "token-seguro",
    };

    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    userServiceSpy = jasmine.createSpyObj("UserService", [
      "sent_email_token_verify",
      "set_email_verify_new_token",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    await TestBed.configureTestingModule({
      declarations: [VerifyEmailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: routeParams,
            },
          },
        },
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Enviar enlace")),
              instant: jasmine.createSpy("instant").and.callFake((key: string) => {
                const dictionary: Record<string, string> = {
                  "message.titleError": "Error",
                  "message.titleSuccess": "Success",
                  "verifyEmail.messages.cannotVerify": "Could not verify the account",
                  "verifyEmail.messages.sessionExpired": "Session expired",
                  "verifyEmail.messages.newLinkSent": "A new link was sent",
                };

                return dictionary[key] || key;
              }),
            },
          },
        },
      ],
    })
      .overrideComponent(VerifyEmailComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  async function createComponent() {
    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it("debe decodificar el correo y marcar exito cuando el token es valido", async () => {
    userServiceSpy.sent_email_token_verify.and.returnValue(of({ ok: true }));

    await createComponent();

    expect(userServiceSpy.sent_email_token_verify).toHaveBeenCalledWith(
      "token-seguro",
      "usuario@ups.edu.ec"
    );
    expect(component.state_success).toBeTrue();
    expect(component.state_request).toBeFalse();
  });

  it("debe redirigir a notfound cuando el token es invalido", async () => {
    userServiceSpy.sent_email_token_verify.and.returnValue(
      throwError(() => ({
        error: { error: "Token invalido" },
      }))
    );

    await createComponent();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/notfound"]);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "Could not verify the account",
    });
  });

  it("debe pedir un nuevo enlace cuando la activacion expiro", async () => {
    userServiceSpy.sent_email_token_verify.and.returnValue(
      throwError(() => ({
        error: { error: "Activacion expirada" },
      }))
    );

    await createComponent();

    expect(component.state_request).toBeTrue();
    expect(component.state_success).toBeFalse();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "Session expired",
    });
  });

  it("debe solicitar un nuevo token y mostrar exito", async () => {
    userServiceSpy.sent_email_token_verify.and.returnValue(of({ ok: true }));
    userServiceSpy.set_email_verify_new_token.and.returnValue(of({ status: 200 }));

    await createComponent();
    component.state_request = true;

    await component.set_token_user();

    expect(userServiceSpy.set_email_verify_new_token).toHaveBeenCalledWith(
      "usuario@ups.edu.ec"
    );
    expect(component.state_request).toBeFalse();
    expect(component.state_success_token).toBeTrue();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "success",
      summary: "Success",
      detail: "A new link was sent",
    });
  });

  it("debe volver al inicio si falla el reenvio del enlace", async () => {
    userServiceSpy.sent_email_token_verify.and.returnValue(of({ ok: true }));
    userServiceSpy.set_email_verify_new_token.and.returnValue(
      throwError(() => new Error("network error"))
    );

    await createComponent();

    await component.set_token_user();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/"]);
  });

  it("debe redirigir a notfound cuando el correo de la ruta no puede decodificarse", async () => {
    routeParams = {
      email: "%%%correo-invalido%%%",
      token: "token-seguro",
    };

    await TestBed.resetTestingModule();

    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    userServiceSpy = jasmine.createSpyObj("UserService", [
      "sent_email_token_verify",
      "set_email_verify_new_token",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    await TestBed.configureTestingModule({
      declarations: [VerifyEmailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: routeParams,
            },
          },
        },
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Enviar enlace")),
              instant: jasmine.createSpy("instant").and.returnValue("Error"),
            },
          },
        },
      ],
    })
      .overrideComponent(VerifyEmailComponent, {
        set: { template: "" },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/notfound"]);
    expect(userServiceSpy.sent_email_token_verify).not.toHaveBeenCalled();
  });
});
