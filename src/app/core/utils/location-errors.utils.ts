import { UserLocation } from "../interfaces/user-location";
import { translateInstant } from "./i18n.utils";

/** Errores `400` de los campos de ubicacion: `{"city_name": ["..."]}`. */
export type UserLocationErrors = Partial<Record<keyof UserLocation, string[]>>;

/** Etiquetas de los campos de ubicacion para los errores que devuelve el backend. */
const LOCATION_ERROR_LABELS: Record<keyof UserLocation, string> = {
  country_code: "location.country",
  country_name: "location.country",
  province_code: "location.province",
  province_name: "location.province",
  city_name: "location.city",
  university_name: "location.university",
};

/**
 * Junta los errores de los campos de ubicacion en un mensaje con el nombre de
 * cada campo ("Ciudad: Este campo es obligatorio."); vacio si no hay.
 */
export function getLocationErrorMessage(
  translator: { instant(key: string): string },
  error: UserLocationErrors | null | undefined
): string {
  if (!error || typeof error !== "object") {
    return "";
  }

  return (Object.keys(LOCATION_ERROR_LABELS) as (keyof UserLocation)[])
    .filter((field) => Array.isArray(error[field]) && error[field].length)
    .map((field) => {
      const label = translateInstant(translator, LOCATION_ERROR_LABELS[field], field);
      return `${label}: ${error[field].join(" ")}`;
    })
    .join(" ");
}
