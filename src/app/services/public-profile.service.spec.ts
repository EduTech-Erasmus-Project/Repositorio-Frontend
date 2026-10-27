import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { environment } from "../../environments/environment";
import { OwnPublicProfileUpdate } from "../core/interfaces/PublicProfile";
import { PublicProfileService } from "./public-profile.service";

describe("PublicProfileService", () => {
  const userKey = "3f2b8c1e-5d4a-4c1b-9a77-2f1e0c9b8a10";
  let service: PublicProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PublicProfileService],
    });

    service = TestBed.inject(PublicProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("debe obtener el perfil propio", () => {
    const response = { user_key: userKey, is_public: true, links: [], degrees: [] };

    service.getOwnProfile().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/user/public-profile/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe guardar todo el perfil propio con PUT", () => {
    const body: OwnPublicProfileUpdate = {
      headline: "Docente de Ingenieria Civil",
      field_visibility: { research_group: "private" },
      links: [{ type: "orcid", url: "https://orcid.org/0000-0002-1825-009X", order: 1 }],
      degrees: [],
    };

    service.saveOwnProfile(body).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/user/public-profile/`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it("debe guardar solo el interruptor con PATCH", () => {
    service.patchOwnProfile({ is_public: false }).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/user/public-profile/`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ is_public: false });
    req.flush({});
  });

  it("debe obtener el perfil publico del autor por user_key", () => {
    service.getAuthor(userKey).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/authors/${userKey}/`);
    expect(req.request.method).toBe("GET");
    req.flush({});
  });

  it("debe propagar el 404 del perfil publico", () => {
    let status = 0;

    service.getAuthor(userKey).subscribe({
      error: (error) => (status = error.status),
    });

    httpMock
      .expectOne(`${environment.baseUrl}/authors/${userKey}/`)
      .flush({ detail: "Not found." }, { status: 404, statusText: "Not Found" });
    expect(status).toBe(404);
  });

  it("debe pedir la grilla del autor con la pagina", () => {
    service.getAuthorLearningObjects(userKey, 2).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.baseUrl}/authors/${userKey}/learning-objects/` &&
        request.params.get("page") === "2"
    );
    expect(req.request.method).toBe("GET");
    req.flush({ count: 0, pages: 0, links: { next: null, previous: null }, results: [] });
  });

  it("debe enviar el tamano de pagina cuando se elige", () => {
    service.getAuthorLearningObjects(userKey, 1, 20).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.baseUrl}/authors/${userKey}/learning-objects/` &&
        request.params.get("page_size") === "20"
    );
    req.flush({ count: 0, pages: 0, links: { next: null, previous: null }, results: [] });
  });

  it("debe pedir la primera pagina por defecto", () => {
    service.getAuthorLearningObjects(userKey).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.baseUrl}/authors/${userKey}/learning-objects/` &&
        request.params.get("page") === "1"
    );
    req.flush({ count: 0, pages: 0, links: { next: null, previous: null }, results: [] });
  });
});
