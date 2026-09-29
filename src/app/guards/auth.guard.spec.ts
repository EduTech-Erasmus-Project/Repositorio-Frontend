import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AuthGuard } from "./auth.guard";
import { LoginService } from "../services/login.service";

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["isLoged"]);
    routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it("debe permitir el acceso cuando la sesion es valida", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));

    const result = await guard.canActivate();

    expect(result).toBeTrue();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });

  it("debe redirigir al login cuando la sesion no es valida", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.reject(false));

    const result = await guard.canActivate();

    expect(result).toBeFalse();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/login");
  });
});
