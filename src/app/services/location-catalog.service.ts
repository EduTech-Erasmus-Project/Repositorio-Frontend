import { HttpClient } from "@angular/common/http";
import { Injectable, InjectionToken, inject } from "@angular/core";
import * as countriesBrowser from "@countrystatecity/countries-browser";
import type { ICity, IState } from "@countrystatecity/countries-browser";
import { Observable, defer, from, of } from "rxjs";
import { catchError, map, shareReplay } from "rxjs/operators";
import { locationEntryNames, normalizeLocationName } from "../core/utils/location-name.utils";

/**
 * Pais del archivo generado `assets/location/countries-es.json`.
 */
export interface LocationCountry {
  iso2: string;
  /** Nombre en ingles de la libreria. */
  name: string;
  /** Nombre que se guarda en `country_name` (regla del backend). */
  name_es: string;
  emoji: string;
}

export interface LocationState {
  iso2: string;
  name: string;
  /** Nombre en el idioma local (por ejemplo `Bayern`); solo para buscar. */
  native: string;
}

export interface LocationCity {
  name: string;
  /** Nombre en el idioma local (por ejemplo `München` para `Munich`); solo para buscar. */
  native: string;
}

/**
 * Parte de la libreria que usa el servicio; se inyecta para poder probarlo
 * sin red.
 */
export type LocationCatalogApi = Pick<
  typeof countriesBrowser,
  "configure" | "getCountries" | "getStatesOfCountry" | "getCitiesOfState"
>;

export const LOCATION_CATALOG_API = new InjectionToken<LocationCatalogApi>(
  "LOCATION_CATALOG_API",
  { providedIn: "root", factory: () => countriesBrowser }
);

/** Archivo generado por `tools/generate-countries-es.mjs`. */
export const COUNTRIES_ES_URL = "assets/location/countries-es.json";

/**
 * Carpeta donde `angular.json` copia `dist/data` de la libreria. La libreria
 * pide `${baseURL}/data/<archivo>`.
 */
export const LOCATION_CATALOG_BASE_PATH = "assets/csc";

@Injectable({
  providedIn: "root",
})
/**
 * Catalogo de paises, provincias y ciudades basado en
 * `@countrystatecity/countries-browser`, servido desde `assets` del propio
 * frontend en lugar de jsDelivr.
 *
 * Errores: `getCountries()` falla si no se puede cargar ninguna lista de
 * paises. Provincias y ciudades nunca fallan: la libreria devuelve `[]` ante
 * cualquier error, por lo que un fallo de red se ve como "sin provincias" y el
 * formulario debe ofrecer texto libre.
 */
export class LocationCatalogService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(LOCATION_CATALOG_API);

  private readonly countries$: Observable<LocationCountry[]> = this.http
    .get<{ countries: LocationCountry[] }>(COUNTRIES_ES_URL)
    .pipe(
      map((file) => file.countries),
      // Sin el archivo generado se usa la lista de la libreria, en ingles.
      catchError(() =>
        from(this.api.getCountries()).pipe(
          map((countries) =>
            countries.map((country) => ({
              iso2: country.iso2,
              name: country.name,
              name_es: country.name,
              emoji: country.emoji,
            }))
          )
        )
      ),
      shareReplay(1)
    );

  constructor() {
    this.api.configure({ baseURL: resolveCatalogBaseUrl() });
  }

  /**
   * Paises en el orden de la libreria (alfabetico en ingles).
   */
  getCountries(): Observable<LocationCountry[]> {
    return this.countries$;
  }

  /**
   * Nombre que se guarda en `country_name`; cadena vacia si el codigo no existe.
   */
  resolveCountryName(countryCode: string): Observable<string> {
    const code = normalizeCode(countryCode);
    return this.countries$.pipe(
      map((countries) => countries.find((country) => country.iso2 === code)?.name_es ?? "")
    );
  }

  /**
   * Provincias del pais ordenadas por nombre; `[]` si no tiene o si falla la carga.
   */
  getStates(countryCode: string): Observable<LocationState[]> {
    return this.loadStates(countryCode).pipe(
      map((states) => sortByName(states.map(toLocationState)))
    );
  }

  /**
   * Ciudades de la provincia ordenadas por nombre; `[]` si no tiene o si falla la carga.
   */
  getCities(countryCode: string, stateCode: string): Observable<LocationCity[]> {
    return this.loadCities(countryCode, stateCode).pipe(
      map((cities) => sortByName(cities.map(toLocationCity)))
    );
  }

  /**
   * Busca la provincia guardada de un usuario: por codigo y, si viene vacio o
   * no coincide, por nombre (sin mayusculas ni tildes).
   */
  findState(
    countryCode: string,
    provinceCode: string,
    provinceName: string
  ): Observable<LocationState | null> {
    const code = normalizeCode(provinceCode);
    const name = normalizeLocationName(provinceName);

    return this.loadStates(countryCode).pipe(
      map((states) => {
        const state =
          (code && states.find((item) => normalizeCode(item.iso2) === code)) ||
          (name && states.find((item) => locationEntryNames(item).has(name))) ||
          null;
        return state ? toLocationState(state) : null;
      })
    );
  }

  /**
   * Busca la ciudad guardada dentro de su provincia. `null` si no esta en la
   * libreria: el formulario la muestra como "Otra ciudad".
   */
  findCity(
    countryCode: string,
    stateCode: string,
    cityName: string
  ): Observable<LocationCity | null> {
    const name = normalizeLocationName(cityName);
    if (!name) {
      return of(null);
    }

    return this.loadCities(countryCode, stateCode).pipe(
      map((cities) => {
        const city = cities.find((item) => locationEntryNames(item).has(name));
        return city ? toLocationCity(city) : null;
      })
    );
  }

  private loadStates(countryCode: string): Observable<IState[]> {
    const code = normalizeCode(countryCode);
    return code ? defer(() => from(this.api.getStatesOfCountry(code))) : of([]);
  }

  private loadCities(countryCode: string, stateCode: string): Observable<ICity[]> {
    const country = normalizeCode(countryCode);
    const state = normalizeCode(stateCode);
    return country && state
      ? defer(() => from(this.api.getCitiesOfState(country, state)))
      : of([]);
  }
}

/**
 * URL absoluta de los datos, relativa al `<base href>` de la app.
 */
export function resolveCatalogBaseUrl(baseUri: string = document.baseURI): string {
  return new URL(LOCATION_CATALOG_BASE_PATH, baseUri).href.replace(/\/$/, "");
}

/**
 * Nombre del pais para mostrar segun el idioma de la interfaz.
 */
export function getCountryDisplayName(country: LocationCountry, language: string): string {
  return language === "en" ? country.name : country.name_es;
}

function normalizeCode(value: string | null | undefined): string {
  return `${value ?? ""}`.trim().toUpperCase();
}

function toLocationState(state: IState): LocationState {
  return { iso2: state.iso2, name: state.name, native: state.native ?? "" };
}

function toLocationCity(city: ICity): LocationCity {
  return { name: city.name, native: city.native ?? "" };
}

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "es"));
}
