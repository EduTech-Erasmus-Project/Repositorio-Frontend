import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { environment } from "src/environments/environment";
import { AddressService } from "./address.service";

describe("AddressService", () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddressService],
    });

    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("debe consultar ciudades activas", () => {
    service.getCitiesActive().subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/address/cities/active`
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe consultar universidades activas por ciudad", () => {
    service.getUniversitiesByCityActive(3).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/address/universities-by-city/3`
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe consultar campus activos por universidad", () => {
    service.getCampusByUniversityActive(7).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/address/campus/active/7`
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe consultar campus activos por universidad y ciudad", () => {
    service.getCampusByUniversityActive(7, 3).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/address/campus/active/7?city=3`
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe consultar paises activos", () => {
    service.getCountriesActive().subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/address/countries/active`
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe crear un pais", () => {
    const payload = { name: "ECUADOR", is_active: true };

    service.createCountry(payload).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/address/countries/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });
  });

  it("debe consultar provincias por pais", () => {
    service.getProvincesByCountry(1).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/address/province/country/1`
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe actualizar una provincia", () => {
    const payload = { name: "AZUAY", country: 1, is_active: true };

    service.updateProvince(9, payload).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/address/province/9`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 9 });
  });

  it("debe crear una ciudad", () => {
    const payload = { name: "CUENCA", country: 1, province: 9, is_active: true } as any;

    service.createCity(payload).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/address/city/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 5 });
  });

  it("debe consultar una universidad por id", () => {
    service.getUniversityById(11).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/address/university/11`
    );
    expect(req.request.method).toBe("GET");
    req.flush({ id: 11 });
  });

  it("debe actualizar una universidad", () => {
    const payload = { name: "UPS", country: 1, is_active: true };

    service.updateUniversity(11, payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/address/university/11`
    );
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 11 });
  });

  it("debe consultar un campus por id", () => {
    service.getCampusById(13).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/address/campus/13`);
    expect(req.request.method).toBe("GET");
    req.flush({ id: 13 });
  });

  it("debe eliminar un campus", () => {
    service.deleteCampus(13).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/address/campus/13`);
    expect(req.request.method).toBe("DELETE");
    req.flush({});
  });
});
