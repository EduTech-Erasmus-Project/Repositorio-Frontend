import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import {
  COUNTRIES_ES_URL,
  LOCATION_CATALOG_API,
  LocationCatalogApi,
  LocationCatalogService,
  getCountryDisplayName,
  resolveCatalogBaseUrl,
} from "./location-catalog.service";

const COUNTRIES_FILE = {
  version: "2.0.0",
  countries: [
    { iso2: "EC", name: "Ecuador", name_es: "Ecuador", emoji: "🇪🇨" },
    { iso2: "DE", name: "Germany", name_es: "Alemania", emoji: "🇩🇪" },
  ],
};

const EC_STATES = [
  { iso2: "P", name: "Pichincha", native: null, translations: {} },
  { iso2: "A", name: "Azuay", native: null, translations: {} },
  { iso2: "SD", name: "Santo Domingo de los Tsáchilas", native: null, translations: {} },
];

const EC_P_CITIES = [
  { name: "Sangolquí", native: null, translations: {} },
  { name: "Quito", native: null, translations: { en: "Quito City" } },
];

describe("LocationCatalogService", () => {
  let service: LocationCatalogService;
  let httpMock: HttpTestingController;
  let api: jasmine.SpyObj<LocationCatalogApi>;

  beforeEach(() => {
    api = jasmine.createSpyObj<LocationCatalogApi>("LocationCatalogApi", [
      "configure",
      "getCountries",
      "getStatesOfCountry",
      "getCitiesOfState",
    ]);
    api.getStatesOfCountry.and.callFake(async (code: string) =>
      (code === "EC" ? EC_STATES : []) as any
    );
    api.getCitiesOfState.and.callFake(async (country: string, state: string) =>
      (country === "EC" && state === "P" ? EC_P_CITIES : []) as any
    );

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: LOCATION_CATALOG_API, useValue: api }],
    });

    service = TestBed.inject(LocationCatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("configura la libreria para leer los datos desde assets", () => {
    expect(api.configure).toHaveBeenCalledWith({
      baseURL: resolveCatalogBaseUrl(),
    });
  });

  it("carga la lista de paises generada una sola vez", async () => {
    const first = firstValueFrom(service.getCountries());
    httpMock.expectOne(COUNTRIES_ES_URL).flush(COUNTRIES_FILE);

    expect(await first).toEqual(COUNTRIES_FILE.countries);
    expect(await firstValueFrom(service.getCountries())).toEqual(COUNTRIES_FILE.countries);
    httpMock.expectNone(COUNTRIES_ES_URL);
  });

  it("usa la lista de la libreria si falta el archivo generado", async () => {
    api.getCountries.and.resolveTo([
      { iso2: "EC", name: "Ecuador", emoji: "🇪🇨" } as any,
    ]);

    const countries = firstValueFrom(service.getCountries());
    httpMock
      .expectOne(COUNTRIES_ES_URL)
      .flush("not found", { status: 404, statusText: "Not Found" });

    expect(await countries).toEqual([
      { iso2: "EC", name: "Ecuador", name_es: "Ecuador", emoji: "🇪🇨" },
    ]);
  });

  it("resuelve country_name con el nombre en espanol y vacio si no existe", async () => {
    const germany = firstValueFrom(service.resolveCountryName("de"));
    httpMock.expectOne(COUNTRIES_ES_URL).flush(COUNTRIES_FILE);

    expect(await germany).toBe("Alemania");
    expect(await firstValueFrom(service.resolveCountryName("ZZ"))).toBe("");
  });

  it("devuelve provincias ordenadas y vacio si el pais no tiene", async () => {
    const states = await firstValueFrom(service.getStates("ec"));

    expect(states.map((state) => state.name)).toEqual([
      "Azuay",
      "Pichincha",
      "Santo Domingo de los Tsáchilas",
    ]);
    expect(api.getStatesOfCountry).toHaveBeenCalledWith("EC");
    expect(await firstValueFrom(service.getStates("GI"))).toEqual([]);
    expect(await firstValueFrom(service.getStates(""))).toEqual([]);
  });

  it("devuelve ciudades ordenadas y no consulta sin provincia", async () => {
    const cities = await firstValueFrom(service.getCities("EC", "p"));

    expect(cities).toEqual([
      { name: "Quito", native: "" },
      { name: "Sangolquí", native: "" },
    ]);
    expect(await firstValueFrom(service.getCities("EC", ""))).toEqual([]);
    expect(api.getCitiesOfState).toHaveBeenCalledTimes(1);
  });

  it("busca la provincia por codigo y, si no hay, por nombre sin tildes", async () => {
    expect(await firstValueFrom(service.findState("EC", "p", ""))).toEqual({
      iso2: "P",
      name: "Pichincha",
      native: "",
    });
    expect(
      await firstValueFrom(service.findState("EC", "", "santo domingo de los tsachilas"))
    ).toEqual({ iso2: "SD", name: "Santo Domingo de los Tsáchilas", native: "" });
    expect(await firstValueFrom(service.findState("EC", "XX", "Galapagos"))).toBeNull();
  });

  it("busca la ciudad por nombre, nativo o traduccion", async () => {
    expect(await firstValueFrom(service.findCity("EC", "P", "SANGOLQUI"))).toEqual({
      name: "Sangolquí",
      native: "",
    });
    expect(await firstValueFrom(service.findCity("EC", "P", "quito city"))).toEqual({
      name: "Quito",
      native: "",
    });
    expect(await firstValueFrom(service.findCity("EC", "P", "Conocoto"))).toBeNull();
    expect(await firstValueFrom(service.findCity("EC", "P", ""))).toBeNull();
  });
});

describe("location catalog helpers", () => {
  it("arma la URL de los datos relativa al base href", () => {
    expect(resolveCatalogBaseUrl("https://repositorio.edutech-project.org/")).toBe(
      "https://repositorio.edutech-project.org/assets/csc"
    );
    expect(resolveCatalogBaseUrl("http://localhost:4200/app/")).toBe(
      "http://localhost:4200/app/assets/csc"
    );
  });

  it("muestra el nombre del pais segun el idioma", () => {
    const germany = { iso2: "DE", name: "Germany", name_es: "Alemania", emoji: "" };

    expect(getCountryDisplayName(germany, "es")).toBe("Alemania");
    expect(getCountryDisplayName(germany, "en")).toBe("Germany");
  });
});
