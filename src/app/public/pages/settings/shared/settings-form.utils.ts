import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import {
  PERSON_NAME_MAX_LENGTH,
  PERSON_NAME_PATTERN,
} from "src/app/core/utils/person-name.utils";

export { PERSON_NAME_PATTERN };

export type SelectOption = { name?: string; code?: number | string | null };
export type CatalogLike = {
  id?: number;
  code?: number | string;
  name?: string;
  description?: string;
};

export const PASSWORD_STRENGTH_PATTERN =
  "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}";
/** Limites del rango de edad del OA; la maxima 99 significa "sin limite". */
export const AGE_MIN = 0;
export const AGE_MAX = 99;
/** Minima del deslizador anterior: `5-100` era el valor por defecto, no una eleccion. */
const LEGACY_SLIDER_MIN = 5;
export const OA_TITLE_MAX_LENGTH = 180;

export const PERSON_NAME_VALIDATORS = [
  Validators.required,
  Validators.pattern(PERSON_NAME_PATTERN),
  Validators.maxLength(PERSON_NAME_MAX_LENGTH),
  Validators.minLength(3),
];

export const REQUIRED_VALIDATORS = [Validators.required];

export const OA_LANGUAGE_OPTIONS: Array<{ name: string; code: string }> = [
  { name: "Alemán", code: "de" },
  { name: "Español", code: "es" },
  { name: "Francés", code: "fr" },
  { name: "Holandés", code: "nl" },
  { name: "Húngaro", code: "hu" },
  { name: "Inglés", code: "en" },
  { name: "Italiano", code: "it" },
  { name: "Portugués", code: "pt" },
  { name: "Ruso", code: "ru" },
  { name: "Otros", code: "Other" },
];

export function mapCatalogOptions<T extends CatalogLike>(
  values: T[],
  labelKey: "name" | "description"
): SelectOption[] {
  return values.map((value) => ({
    name: value[labelKey] || value.description || value.name || "",
    code: value.id ?? value.code ?? null,
  }));
}

export function resolveCatalogOptionValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (Array.isArray(value)) {
    const first = value[0] as { id?: number; code?: number | string } | undefined;
    return first?.id ?? first?.code ?? null;
  }

  if (typeof value === "object") {
    const option = value as { id?: number; code?: number | string };
    return option.id ?? option.code ?? null;
  }

  return value;
}

/**
 * Lee el rango guardado (`"min-max"`). Devuelve `null` si no hay una edad
 * elegida: vacio, otro formato, imposible o el `5-100` del deslizador
 * anterior. Una maxima mayor a 99 pasa a 99 (sin limite), como en el
 * comando `normalize_oa_age_ranges` del backend.
 */
export function parseAgeRange(rawRange: string | null | undefined): [number, number] | null {
  const match = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(rawRange ?? "");
  if (!match) {
    return null;
  }

  const min = Number(match[1]);
  const max = Number(match[2]);
  if (min > max || min > AGE_MAX) {
    return null;
  }
  if (max > AGE_MAX) {
    return min === LEGACY_SLIDER_MIN ? null : [min, AGE_MAX];
  }

  return [min, max];
}

export function formatAgeRange(range: [number, number] | number[] | null | undefined): string {
  if (!Array.isArray(range) || range.length !== 2) {
    return "";
  }

  return `${range[0]}-${range[1]}`;
}

/** Edad tipica del nivel CINE como rango; sin maxima se usa 99 (sin limite). */
export function levelAgeRange(
  level: { typical_age_min?: number | null; typical_age_max?: number | null } | null | undefined
): [number, number] | null {
  if (level?.typical_age_min === null || level?.typical_age_min === undefined) {
    return null;
  }

  return [level.typical_age_min, level.typical_age_max ?? AGE_MAX];
}

export function controlInvalid(control: AbstractControl | null | undefined): boolean {
  return !!control && control.invalid && (control.dirty || control.touched);
}

export function controlHasError(
  control: AbstractControl | null | undefined,
  errorCode: string
): boolean {
  return !!control && control.hasError(errorCode);
}

export function passwordMatchValidator(
  passwordControlName: string,
  confirmPasswordControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordValue = control.get(passwordControlName)?.value;
    const confirmValue = control.get(confirmPasswordControlName)?.value;

    if (!confirmValue) {
      return null;
    }

    return passwordValue === confirmValue ? null : { passwordMismatch: true };
  };
}
