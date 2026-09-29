import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { TeacherGuard } from "./teacher.guard";
import { LoginService } from "../services/login.service";

describe("TeacherGuard", () => {
  let guard: TeacherGuard;
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
        TeacherGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(TeacherGuard);
  });

  it("debe permitir el acceso cuando el usuario tiene rol teacher", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.returnValue(true);

    expect(await guard.canActivate()).toBeTrue();
    expect(loginServiceSpy.isLoged).toHaveBeenCalled();
    expect(loginServiceSpy.validateRole).toHaveBeenCalledWith("teacher");
  });

  it("debe redirigir a home cuando el usuario no tiene rol teacher", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.returnValue(false);

    expect(await guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["home"]);
  });
});
