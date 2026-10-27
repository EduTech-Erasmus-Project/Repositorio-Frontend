/**
 * Ubicacion de docentes y expertos tal como la guarda el backend.
 *
 * Son textos en el primer nivel del usuario: codigos ISO y nombres tomados de
 * `@countrystatecity/countries-browser`, nunca ids de la libreria. Ver
 * `docs/plan_integracion_ubicacion_usuario.md`.
 */
export interface UserLocation {
  /** ISO 3166-1 alpha-2 en mayusculas, por ejemplo `EC`. */
  country_code: string;
  /** `translations.es` del pais o, si no hay, su `name`. */
  country_name: string;
  /** `state.iso2`; vacio si el pais no tiene provincias en la libreria. */
  province_code: string;
  province_name: string;
  /** Nombre de la libreria o texto libre ("Otra ciudad"). */
  city_name: string;
  university_name: string;
}

/**
 * Longitudes maximas que valida el backend para cada campo.
 */
export const USER_LOCATION_MAX_LENGTH: Readonly<Record<keyof UserLocation, number>> = {
  country_code: 2,
  country_name: 100,
  province_code: 10,
  province_name: 100,
  city_name: 150,
  university_name: 200,
};
