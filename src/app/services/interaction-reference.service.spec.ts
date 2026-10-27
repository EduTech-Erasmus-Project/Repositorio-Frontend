import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "src/environments/environment";
import { InteractionReferenceService } from "./interaction-reference.service";

describe("InteractionReferenceService", () => {
  let service: InteractionReferenceService;
  let httpMock: HttpTestingController;
  const url = `${environment.baseUrl}/interaction-ref/`;

  beforeEach(() => {
    localStorage.removeItem("interaction_reference");
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InteractionReferenceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem("interaction_reference");
  });

  it("debe pedir la referencia una sola vez aunque se llame a la vez y guardarla", async () => {
    localStorage.setItem("key_ref", "token-viejo");
    localStorage.setItem("array_view", "[7]");

    const first = service.get();
    const second = service.get();
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ key_ref: environment.key_ref });
    req.flush({ reference: "valor:firma" });

    expect(await first).toBe("valor:firma");
    expect(await second).toBe("valor:firma");
    expect(localStorage.getItem("interaction_reference")).toBe("valor:firma");
    // Se limpian las claves del flujo anterior.
    expect(localStorage.getItem("key_ref")).toBeNull();
    expect(localStorage.getItem("array_view")).toBeNull();
  });

  it("debe reutilizar la referencia guardada sin pedir otra", async () => {
    localStorage.setItem("interaction_reference", "guardada:firma");

    expect(await service.get()).toBe("guardada:firma");
    httpMock.expectNone(url);
  });

  it("debe devolver null si el backend no entrega la referencia y reintentar despues", async () => {
    const failed = service.get();
    httpMock.expectOne(url).flush({ message: "Error" }, { status: 429, statusText: "Too Many Requests" });
    expect(await failed).toBeNull();

    const retry = service.get();
    httpMock.expectOne(url).flush({ reference: "nueva:firma" });
    expect(await retry).toBe("nueva:firma");
  });
});
