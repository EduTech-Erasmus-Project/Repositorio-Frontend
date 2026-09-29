import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { StudentGuard } from "./student.guard";
import { LoginService } from "../services/login.service";

describe("StudentGuard", () => {
  let guard: StudentGuard;
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
        StudentGuard,
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(StudentGuard);
  });

  it("debe permitir el acceso cuando el usuario tiene rol student", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.returnValue(true);

    expect(await guard.canActivate()).toBeTrue();
    expect(loginServiceSpy.isLoged).toHaveBeenCalled();
    expect(loginServiceSpy.validateRole).toHaveBeenCalledWith("student");
  });

  it("debe redirigir a home cuando el usuario no tiene rol student", async () => {
    loginServiceSpy.isLoged.and.returnValue(Promise.resolve(true));
    loginServiceSpy.validateRole.and.returnValue(false);

    expect(await guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["home"]);
  });
});
