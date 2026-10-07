import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { CheckLoginGuard } from "./check-login.guard";
import { LoginService } from "../services/login.service";

describe("CheckLoginGuard", () => {
  let guard: CheckLoginGuard;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj("LoginService", [
      "bootstrapSession",
      "validateUser",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        CheckLoginGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(CheckLoginGuard);
  });

  it("debe bloquear el acceso y delegar la redireccion por rol cuando ya existe sesion", async () => {
    loginServiceSpy.bootstrapSession.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateUser.and.returnValue(Promise.resolve(true));

    const result = await guard.canActivate();

    expect(result).toBeFalse();
    expect(loginServiceSpy.validateUser).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });

  it("debe permitir el acceso cuando no existe sesion", async () => {
    loginServiceSpy.bootstrapSession.and.returnValue(Promise.resolve(false));

    const result = await guard.canActivate();

    expect(result).toBeTrue();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });
});
