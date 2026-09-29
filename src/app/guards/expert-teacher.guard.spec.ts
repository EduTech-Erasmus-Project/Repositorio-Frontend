import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { ExpertAndTeacherGuard } from "./expert-teacher.guard";
import { LoginService } from "../services/login.service";

describe("ExpertAndTeacherGuard", () => {
  let guard: ExpertAndTeacherGuard;
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
        ExpertAndTeacherGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(ExpertAndTeacherGuard);
  });

  it("debe permitir el acceso cuando el usuario es expert", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "expert");

    expect(await guard.canActivate()).toBeTrue();
  });

  it("debe permitir el acceso cuando el usuario es teacher", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "teacher");

    expect(await guard.canActivate()).toBeTrue();
  });

  it("debe redirigir a home cuando el usuario no es expert ni teacher", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.returnValue(false);

    expect(await guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["home"]);
  });
});
