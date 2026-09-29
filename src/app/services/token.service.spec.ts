import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { environment } from "../../environments/environment";
import { TokenService } from "./token.service";

describe("TokenService", () => {
  let service: TokenService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TokenService],
    });

    service = TestBed.inject(TokenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("debe devolver true cuando el token es valido", () => {
    let result: boolean | undefined;

    service.validateToken("valid-token").subscribe((response) => {
      result = response;
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/token/verify/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ token: "valid-token" });
    req.flush({});

    expect(result).toBeTrue();
  });

  it("debe devolver false cuando el backend reporta un token invalido", () => {
    let result: boolean | undefined;

    service.validateToken("invalid-token").subscribe((response) => {
      result = response;
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/token/verify/`);
    req.flush({ detail: "Token is invalid" });

    expect(result).toBeFalse();
  });

  it("debe devolver false cuando falla la peticion de validacion", () => {
    let result: boolean | undefined;

    service.validateToken("broken-token").subscribe((response) => {
      result = response;
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/token/verify/`);
    req.flush({}, { status: 401, statusText: "Unauthorized" });

    expect(result).toBeFalse();
  });

  it("debe refrescar la sesion usando solo cookie auth", () => {
    service.refreshToken().subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/token/refresh/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({});
    req.flush({ access: "new-access-token" });
  });
});
