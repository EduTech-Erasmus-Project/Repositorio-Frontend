import {
  HttpClient,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpRequest,
} from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthInterceptor } from "./auth.interceptor";
import { LoginService } from "./login.service";
import { SessionRefreshService } from "./session-refresh.service";

describe("AuthInterceptor", () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let sessionRefreshServiceSpy: jasmine.SpyObj<SessionRefreshService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    sessionRefreshServiceSpy = jasmine.createSpyObj("SessionRefreshService", ["refreshOnce"]);
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["signOut"]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        { provide: SessionRefreshService, useValue: sessionRefreshServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("debe agregar los headers base aun sin bearer local", () => {
    http.get("/api/test").subscribe();

    const req = httpMock.expectOne("/api/test");
    expect(req.request.headers.get("Accept")).toBe("application/json");
    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush({ ok: true });
  });

  it("debe exponer un helper para clonar requests autenticadas", () => {
    const interceptor = TestBed.inject(HTTP_INTERCEPTORS)[0] as AuthInterceptor;
    const request = new HttpRequest("GET", "/api/test");

    const updatedRequest = interceptor.addAuthorizationHeader(request);

    expect(updatedRequest.headers.get("Accept")).toBe("application/json");
    expect(updatedRequest.headers.has("Authorization")).toBeFalse();
  });

  it("no debe enviar Authorization a endpoints del flujo de sesion por cookie", () => {
    http.post(`${environment.baseUrl}/login/`, { email: "a@a.com" }).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/login/`);
    expect(req.request.headers.has("Authorization")).toBeFalse();
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ ok: true });
  });

  it("debe agregar X-CSRFToken y withCredentials en mutaciones al backend principal", () => {
    document.cookie = "csrftoken=test-csrf-token";

    http.post(`${environment.baseUrl}/logout/`, {}).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/logout/`);
    expect(req.request.headers.get("X-CSRFToken")).toBe("test-csrf-token");
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ ok: true });

    document.cookie =
      "csrftoken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });

  it("no debe forzar withCredentials para endpoints externos al backend principal", () => {
    http.get("https://example.com/public-feed").subscribe();

    const req = httpMock.expectOne("https://example.com/public-feed");
    expect(req.request.withCredentials).toBeFalse();
    req.flush({ ok: true });
  });

  it("debe refrescar el token y reintentar la peticion cuando expira el access token", () => {
    sessionRefreshServiceSpy.refreshOnce.and.returnValue(of({} as any));

    let response: any;

    http.get(`${environment.baseUrl}/secure`).subscribe((res) => {
      response = res;
    });

    const failedReq = httpMock.expectOne(`${environment.baseUrl}/secure`);
    expect(failedReq.request.headers.has("Authorization")).toBeFalse();
    failedReq.flush(
      { messages: [{ token_type: "access" }] },
      { status: 401, statusText: "Unauthorized" }
    );

    const retriedReq = httpMock.expectOne(`${environment.baseUrl}/secure`);
    expect(sessionRefreshServiceSpy.refreshOnce).toHaveBeenCalled();
    expect(retriedReq.request.headers.has("Authorization")).toBeFalse();
    retriedReq.flush({ ok: true });

    expect(response).toEqual({ ok: true });
  });

  it("debe refrescar y reintentar la peticion ante un 401 plano de credenciales faltantes", () => {
    sessionRefreshServiceSpy.refreshOnce.and.returnValue(of({} as any));

    let response: any;

    http.get(`${environment.baseUrl}/learning-objects/my-qualification/`).subscribe((res) => {
      response = res;
    });

    const failedReq = httpMock.expectOne(`${environment.baseUrl}/learning-objects/my-qualification/`);
    failedReq.flush(
      { detail: "Authentication credentials were not provided." },
      { status: 401, statusText: "Unauthorized" }
    );

    const retriedReq = httpMock.expectOne(`${environment.baseUrl}/learning-objects/my-qualification/`);
    expect(sessionRefreshServiceSpy.refreshOnce).toHaveBeenCalled();
    retriedReq.flush({ results: [] });

    expect(response).toEqual({ results: [] });
    expect(loginServiceSpy.signOut).not.toHaveBeenCalled();
  });

  it("debe refrescar y reintentar cuando backend responde token_not_valid en una request protegida", () => {
    sessionRefreshServiceSpy.refreshOnce.and.returnValue(of({} as any));

    let response: any;

    http.get(`${environment.baseUrl}/learning-objects/my-qualification/`).subscribe((res) => {
      response = res;
    });

    const failedReq = httpMock.expectOne(`${environment.baseUrl}/learning-objects/my-qualification/`);
    failedReq.flush(
      { code: "token_not_valid" },
      { status: 401, statusText: "Unauthorized" }
    );

    const retriedReq = httpMock.expectOne(`${environment.baseUrl}/learning-objects/my-qualification/`);
    expect(sessionRefreshServiceSpy.refreshOnce).toHaveBeenCalled();
    retriedReq.flush({ results: [] });

    expect(response).toEqual({ results: [] });
    expect(loginServiceSpy.signOut).not.toHaveBeenCalled();
  });

  it("debe cerrar sesion cuando el refresh token ya no es valido", () => {
    let completed = false;
    let receivedError = false;
    sessionRefreshServiceSpy.refreshOnce.and.returnValue(of({} as any));

    http.post(`${environment.baseUrl}/token/refresh/`, {}).subscribe({
      next: () => {
        fail("no debe emitir datos cuando el token es invalido");
      },
      error: () => {
        receivedError = true;
      },
      complete: () => {
        completed = true;
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/token/refresh/`);
    req.flush(
      { code: "token_not_valid" },
      { status: 401, statusText: "Unauthorized" }
    );

    expect(loginServiceSpy.signOut).toHaveBeenCalled();
    expect(receivedError).toBeFalse();
    expect(completed).toBeTrue();
  });

  it("debe cerrar sesion si el refresh falla durante el reintento", () => {
    sessionRefreshServiceSpy.refreshOnce.and.returnValue(
      new Observable((subscriber) => {
        subscriber.error(
          new HttpErrorResponse({
            status: 401,
            statusText: "Unauthorized",
            error: { detail: "Authentication credentials were not provided." },
          })
        );
      })
    );

    let completed = false;

    http.get(`${environment.baseUrl}/learning-objects/my-qualification/`).subscribe({
      complete: () => {
        completed = true;
      },
    });

    const failedReq = httpMock.expectOne(`${environment.baseUrl}/learning-objects/my-qualification/`);
    failedReq.flush(
      { detail: "Authentication credentials were not provided." },
      { status: 401, statusText: "Unauthorized" }
    );

    expect(sessionRefreshServiceSpy.refreshOnce).toHaveBeenCalled();
    expect(loginServiceSpy.signOut).toHaveBeenCalled();
    expect(completed).toBeTrue();
  });

  it("debe propagar errores no relacionados con autenticacion", () => {
    let capturedError: HttpErrorResponse | undefined;

    http.get("/api/secure").subscribe({
      next: () => {
        fail("no debe emitir datos cuando existe un error del servidor");
      },
      error: (error) => {
        capturedError = error;
      },
    });

    const req = httpMock.expectOne("/api/secure");
    req.flush(
      { detail: "server error" },
      { status: 500, statusText: "Server Error" }
    );

    expect(capturedError).toBeTruthy();
    expect(capturedError?.status).toBe(500);
    expect(loginServiceSpy.signOut).not.toHaveBeenCalled();
    expect(sessionRefreshServiceSpy.refreshOnce).not.toHaveBeenCalled();
  });
});
