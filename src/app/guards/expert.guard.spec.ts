import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { ExpertGuard } from "./expert.guard";
import { LoginService } from "../services/login.service";

describe("ExpertGuard", () => {
  let guard: ExpertGuard;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj("LoginService", [
      "validateRole",
      "isLoged",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        ExpertGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(ExpertGuard);
  });

  it("debe permitir el acceso cuando el usuario tiene rol expert", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.returnValue(true);

    expect(await guard.canActivate()).toBeTrue();
    expect(loginServiceSpy.isLoged).toHaveBeenCalled();
    expect(loginServiceSpy.validateRole).toHaveBeenCalledWith("expert");
  });

  it("debe redirigir a home cuando el usuario no tiene rol expert", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.returnValue(false);

    expect(await guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["home"]);
  });
});
