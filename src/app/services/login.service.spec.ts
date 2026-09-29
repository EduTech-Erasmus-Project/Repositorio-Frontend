import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { CurrentUser } from "../core/interfaces/CurrentUser";
import { LoginService } from "./login.service";
import { StorageService } from "./storage.service";
import { SessionRefreshService } from "./session-refresh.service";

describe("LoginService", () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let storageService: StorageService;
  let sessionRefreshServiceSpy: jasmine.SpyObj<SessionRefreshService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function getLastState(states: boolean[]): boolean | undefined {
    return states[states.length - 1];
  }

  beforeEach(() => {
    localStorage.clear();

    sessionRefreshServiceSpy = jasmine.createSpyObj("SessionRefreshService", [
      "refreshOnce",
      "startPreventiveRefresh",
      "stopPreventiveRefresh",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoginService,
        StorageService,
        { provide: SessionRefreshService, useValue: sessionRefreshServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it("debe guardar el usuario autenticado en memoria y almacenamiento", () => {
    const user: CurrentUser = {
      id: 10,
      first_name: "Ana",
      roles: ["teacher"],
    };

    service.currentUser = user;

    expect(service.user).toEqual(user);
    expect(storageService.getLocalItem("current_user")).toBeNull();
    expect(sessionRefreshServiceSpy.startPreventiveRefresh).toHaveBeenCalled();
  });

  it("debe enviar las credenciales al endpoint de inicio de sesion", () => {
    const credentials = { email: "ana@test.com", password: "123456" };

    service.signIn(credentials).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/login/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(credentials);
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ access: "token" });
  });

  it("debe permitir inicializar la cookie CSRF antes del login", () => {
    let response: any;

    service.initializeCsrfSession().subscribe((value) => {
      response = value;
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/csrf/`);
    expect(req.request.method).toBe("GET");
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ message: "CSRF cookie set successfully", cookie: "csrftoken" });

    expect(response).toEqual({
      message: "CSRF cookie set successfully",
      cookie: "csrftoken",
    });
  });

  it("debe validar roles correctamente aun cuando no exista usuario autenticado", () => {
    expect(service.validateRole("teacher")).toBeFalse();

    service.currentUser = { roles: ["teacher"] } as CurrentUser;

    expect(service.validateRole("teacher")).toBeTrue();
    expect(service.validateRole("student")).toBeFalse();
  });

  it("debe cerrar sesion, limpiar almacenamiento y navegar al inicio", () => {
    const loginStates: boolean[] = [];
    const menuStates: boolean[] = [];
    const loginSub = service.characterLogin$.subscribe((state) => {
      loginStates.push(state);
    });
    const menuSub = service.characterMenu$.subscribe((state) => {
      menuStates.push(state);
    });

    service.currentUser = { id: 11, roles: ["teacher"] } as CurrentUser;
    service.signOut();

    const req = httpMock.expectOne(`${environment.baseUrl}/logout/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({});
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ message: "Logout successful" });

    expect(getLastState(menuStates)).toBeFalse();
    expect(getLastState(loginStates)).toBeFalse();
    expect(service.user).toBeNull();
    expect(storageService.getLocalItem("current_user")).toBeNull();
    expect(storageService.getLocalItem("data_ref")).toBeNull();
    expect(storageService.getLocalItem("data_acc")).toBeNull();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/");
    expect(sessionRefreshServiceSpy.stopPreventiveRefresh).toHaveBeenCalled();
    menuSub.unsubscribe();
    loginSub.unsubscribe();
  });

  it("no debe duplicar el logout server-side mientras ya existe un cierre en curso", () => {
    service.currentUser = { id: 11, roles: ["teacher"] } as CurrentUser;

    service.signOut();
    service.signOut();

    const requests = httpMock.match(`${environment.baseUrl}/logout/`);
    expect(requests.length).toBe(1);
    expect(requests[0].request.method).toBe("POST");
    requests[0].flush({ message: "Logout successful" });

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/");
    expect(sessionRefreshServiceSpy.stopPreventiveRefresh).toHaveBeenCalledTimes(1);
  });

  it("debe obtener el usuario autenticado y redirigir a administracion", async () => {
    const adminUser = {
      id: 1,
      roles: [],
      administrator: { id: 99 },
    } as CurrentUser;

    const resultPromise = service.validateUser();

    const req = httpMock.expectOne(`${environment.baseUrl}/user/`);
    expect(req.request.method).toBe("GET");
    req.flush(adminUser);

    const result = await resultPromise;

    expect(result).toBeTrue();
    expect(service.user).toEqual(adminUser);
    expect(storageService.getLocalItem("current_user")).toBeNull();
    expect(sessionRefreshServiceSpy.startPreventiveRefresh).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["admin"]);
  });

  it("debe obtener el usuario autenticado y redirigir a recomendados para estudiante", async () => {
    const loginStates: boolean[] = [];
    const loginSub = service.characterLogin$.subscribe((state) => {
      loginStates.push(state);
    });
    const studentUser = {
      id: 2,
      roles: ["student"],
      administrator: null,
    } as CurrentUser;

    const resultPromise = service.validateUser();

    const req = httpMock.expectOne(`${environment.baseUrl}/user/`);
    req.flush(studentUser);

    const result = await resultPromise;

    expect(result).toBeTrue();
    expect(service.user).toEqual(studentUser);
    expect(sessionRefreshServiceSpy.startPreventiveRefresh).toHaveBeenCalled();
    expect(getLastState(loginStates)).toBeTrue();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["recommended"]);
    loginSub.unsubscribe();
  });

  it("debe resolver true cuando `/user/` confirma una sesion valida", async () => {
    const resultPromise = service.isLoged();

    const req = httpMock.expectOne(`${environment.baseUrl}/user/`);
    expect(req.request.method).toBe("GET");
    req.flush({ id: 5, roles: ["teacher"] } as CurrentUser);

    const result = await resultPromise;

    expect(result).toBeTrue();
    expect(service.user).toEqual({ id: 5, roles: ["teacher"] } as CurrentUser);
    expect(sessionRefreshServiceSpy.refreshOnce).not.toHaveBeenCalled();
    expect(sessionRefreshServiceSpy.startPreventiveRefresh).toHaveBeenCalled();
  });

  it("no debe intentar rehidratar sesion pasiva cuando no existe historial local", async () => {
    const result = await service.bootstrapSession();

    expect(result).toBeFalse();
  });

  it("debe intentar rehidratar sesion pasiva cuando existe historial local", async () => {
    storageService.saveLocalItem("roa_session_recovery_hint", "1");

    const resultPromise = service.bootstrapSession();

    const req = httpMock.expectOne(`${environment.baseUrl}/user/`);
    req.flush({ id: 12, roles: ["teacher"] } as CurrentUser);

    const result = await resultPromise;

    expect(result).toBeTrue();
    expect(service.user).toEqual({ id: 12, roles: ["teacher"] } as CurrentUser);
    expect(sessionRefreshServiceSpy.startPreventiveRefresh).toHaveBeenCalled();
  });

  it("debe intentar refresh por cookie cuando `/user/` responde 401", async () => {
    sessionRefreshServiceSpy.refreshOnce.and.returnValue(of({} as any));

    const resultPromise = service.isLoged();

    const firstReq = httpMock.expectOne(`${environment.baseUrl}/user/`);
    firstReq.flush({}, { status: 401, statusText: "Unauthorized" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    const secondReq = httpMock.expectOne(`${environment.baseUrl}/user/`);
    secondReq.flush({ id: 7, roles: ["expert"] } as CurrentUser);

    const result = await resultPromise;

    expect(result).toBeTrue();
    expect(sessionRefreshServiceSpy.refreshOnce).toHaveBeenCalled();
    expect(service.user).toEqual({ id: 7, roles: ["expert"] } as CurrentUser);
    expect(sessionRefreshServiceSpy.startPreventiveRefresh).toHaveBeenCalled();
  });

  it("debe rechazar la sesion cuando `/user/` falla y el refresh por cookie tambien falla", async () => {
    let error: boolean | undefined;
    sessionRefreshServiceSpy.refreshOnce.and.returnValue(throwError(() => new Error("refresh failed")));

    const resultPromise = service.isLoged().catch((reason) => {
      error = reason;
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/user/`);
    req.flush({}, { status: 401, statusText: "Unauthorized" });

    await resultPromise;

    expect(error).toBeFalse();
    expect(sessionRefreshServiceSpy.refreshOnce).toHaveBeenCalled();
    expect(sessionRefreshServiceSpy.stopPreventiveRefresh).toHaveBeenCalled();
  });

  it("debe cerrar sesion de cambio de contrasena y navegar al login", () => {
    const loginStates: boolean[] = [];
    const menuStates: boolean[] = [];
    const loginSub = service.characterLogin$.subscribe((state) => {
      loginStates.push(state);
    });
    const menuSub = service.characterMenu$.subscribe((state) => {
      menuStates.push(state);
    });

    service.currentUser = { id: 11, roles: ["teacher"] } as CurrentUser;
    service.signOutPass();

    const req = httpMock.expectOne(`${environment.baseUrl}/logout/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({});
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ message: "Logout successful" });

    expect(getLastState(menuStates)).toBeFalse();
    expect(getLastState(loginStates)).toBeFalse();
    expect(service.user).toBeNull();
    expect(storageService.getLocalItem("current_user")).toBeNull();
    expect(storageService.getLocalItem("data_ref")).toBeNull();
    expect(storageService.getLocalItem("data_acc")).toBeNull();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/login");
    expect(sessionRefreshServiceSpy.stopPreventiveRefresh).toHaveBeenCalled();
    menuSub.unsubscribe();
    loginSub.unsubscribe();
  });
});
