import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AdminGuard } from "./admin.guard";
import { LoginService } from "../services/login.service";

describe("AdminGuard", () => {
  let guard: AdminGuard;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj(
      "LoginService",
      ["validateRole", "isLoged"],
      {
        user: null,
      }
    );
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AdminGuard);
  });

  it("debe permitir el acceso cuando el usuario es administrador", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    Object.defineProperty(loginServiceSpy, "user", {
      value: { administrator: { id: 1 }, roles: [] },
      configurable: true,
    });

    expect(await guard.canActivate()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it("debe permitir el acceso cuando el usuario es superuser", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    Object.defineProperty(loginServiceSpy, "user", {
      value: { administrator: null, roles: ["superuser"] },
      configurable: true,
    });
    loginServiceSpy.validateRole.and.returnValue(true);

    expect(await guard.canActivate()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it("debe redirigir al inicio cuando el usuario no tiene permisos", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    Object.defineProperty(loginServiceSpy, "user", {
      value: { administrator: null, roles: ["teacher"] },
      configurable: true,
    });
    loginServiceSpy.validateRole.and.returnValue(false);

    expect(await guard.canActivate()).toBeFalse();
    expect(loginServiceSpy.isLoged).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/"]);
  });
});
