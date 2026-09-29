import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { environment } from "../../environments/environment";
import { SearchService } from "./search.service";

describe("SearchService", () => {
  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchService],
    });

    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("debe consultar el total de usuarios", () => {
    const response = { total_users: 120 };

    service.countUsers().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/user-count/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe consultar el total de objetos aprobados", () => {
    const response = { total: 45 };

    service.countObjectLearning().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/total-oa-approved/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe consultar las areas de interes", () => {
    const response = [{ id: 1, name: "Matematica" }];

    service.getInterestAreas().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/knowledge-area/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe consultar las preferencias del usuario", () => {
    const response = [{ id: 2, name: "Programacion" }];

    service.getPreferences().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/user-preferences/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe consultar los niveles de educacion", () => {
    const response = [{ id: 3, name: "Superior" }];

    service.getLevelEducation().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/education-level/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe buscar objetos de aprendizaje con query params", () => {
    const queryParams = {
      general_title: "Algebra",
      liked: "True",
    };

    service.search(queryParams).subscribe((res: any) => {
      expect(res).toEqual({ results: [] });
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.baseUrl}/learning-objects/search/` &&
        request.params.get("general_title") === "Algebra" &&
        request.params.get("liked") === "True"
    );
    expect(req.request.method).toBe("GET");
    req.flush({ results: [] });
  });

  it("debe paginar la busqueda por numero de pagina", () => {
    service.searchPagePaginator(3).subscribe((res: any) => {
      expect(res).toEqual({ results: [] });
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects/search/?page=3`
    );
    expect(req.request.method).toBe("GET");
    req.flush({ results: [] });
  });

  it("debe consultar la busqueda para experto", () => {
    const queryParams = {
      is_evaluated: "True",
      recent: "True",
    };

    service.searchExpert(queryParams).subscribe((res: any) => {
      expect(res).toEqual({ results: [] });
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url ===
          `${environment.baseUrl}/learning-objects/search/expert/` &&
        request.params.get("is_evaluated") === "True" &&
        request.params.get("recent") === "True"
    );
    expect(req.request.method).toBe("GET");
    req.flush({ results: [] });
  });

  it("debe consultar los anios de creacion para filtros", () => {
    const response = [2021, 2022, 2023];

    service.getCreatedYear().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/learning-objects/years/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe consultar las licencias disponibles para filtros", () => {
    const response = [{ id: 1, name: "CC BY" }];

    service.getLicenses().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/license/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });
});
