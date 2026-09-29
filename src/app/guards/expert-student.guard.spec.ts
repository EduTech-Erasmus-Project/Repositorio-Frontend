import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { ExpertAndStudentGuard } from "./expert-student.guard";
import { LoginService } from "../services/login.service";

describe("ExpertAndStudentGuard", () => {
  let guard: ExpertAndStudentGuard;
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
        ExpertAndStudentGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(ExpertAndStudentGuard);
  });

  it("debe permitir el acceso cuando el usuario es expert", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "expert");

    expect(await guard.canActivate()).toBeTrue();
  });

  it("debe permitir el acceso cuando el usuario es student", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "student");

    expect(await guard.canActivate()).toBeTrue();
  });

  it("debe redirigir a home cuando el usuario no es expert ni student", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.returnValue(false);

    expect(await guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["home"]);
  });
});
