import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { environment } from "../../environments/environment";
import { UserGeneral } from "../core/models/userGeneral";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("debe obtener el detalle del usuario por id", () => {
    const response = { id: 25, first_name: "Maria" };

    service.getUserDetail(25).subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/user-management/25`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe actualizar los datos del usuario", () => {
    const user: UserGeneral = {
      id: 8,
      first_name: "Carlos",
      last_name: "Perez",
    };

    service.updateUser(user).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/user-management/8/`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(user);
    req.flush({ ok: true });
  });

  it("debe enviar la imagen del usuario como FormData", () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    service.updateImage(file, 19).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/user/photo/19/`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get("image")).toBe(file);
    req.flush({ ok: true });
  });

  it("debe consultar la verificacion de correo con token y email", () => {
    service.sent_email_token_verify("token-123", "user@test.com").subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/email-verify/token-123/user@test.com`
    );
    expect(req.request.method).toBe("GET");
    req.flush({ status: "ok" });
  });

  it("debe solicitar un nuevo token de verificacion por email", () => {
    service.set_email_verify_new_token("user@test.com").subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/set-verify/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ email: "user@test.com" });
    req.flush({ status: "ok" });
  });

  it("debe enviar el formulario de contacto como FormData", () => {
    const data = {
      name: "Maria",
      email: "maria@test.com",
      message: "Formulario de contacto\r\n\r\nLinea dos",
    };

    service.sendContactEmail(data).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/contact-email/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get("name")).toBe("Maria");
    expect(req.request.body.get("email")).toBe("maria@test.com");
    expect(req.request.body.get("content")).toBe("Formulario de contacto\n\nLinea dos");
    req.flush({ ok: true });
  });
});
