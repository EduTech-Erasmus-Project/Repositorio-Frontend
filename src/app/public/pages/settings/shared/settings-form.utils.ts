import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export type SelectOption = { name?: string; code?: number | string | null };
export type CatalogLike = {
  id?: number;
  code?: number | string;
  name?: string;
  description?: string;
};

export const PERSON_NAME_PATTERN = "[a-zA-ZñÑáéíóúÁÉÍÓÚs ]+";
export const PASSWORD_STRENGTH_PATTERN =
  "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}";
export const DEFAULT_AGE_RANGE: [number, number] = [5, 100];
export const OA_TITLE_MAX_LENGTH = 180;

export const PERSON_NAME_VALIDATORS = [
  Validators.required,
  Validators.pattern(PERSON_NAME_PATTERN),
  Validators.maxLength(20),
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

export function parseAgeRange(
  rawRange: string | null | undefined,
  defaultRange: [number, number] = DEFAULT_AGE_RANGE
): [number, number] {
  if (!rawRange) {
    return defaultRange;
  }

  const range = rawRange
    .split("-")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => !Number.isNaN(value));

  if (range.length !== 2 || range[0] > range[1]) {
    return defaultRange;
  }

  return [range[0], range[1]];
}

export function formatAgeRange(range: [number, number] | number[] | null | undefined): string {
  if (!Array.isArray(range) || range.length !== 2) {
    return `${DEFAULT_AGE_RANGE[0]}-${DEFAULT_AGE_RANGE[1]}`;
  }

  return `${range[0]}-${range[1]}`;
}

export function getRangeLabel(
  range: [number, number] | number[] | null | undefined,
  fallback: [number, number] = DEFAULT_AGE_RANGE
): string {
  if (!Array.isArray(range) || range.length !== 2) {
    return `${fallback[0]} - ${fallback[1]}`;
  }

  return `${range[0]} - ${range[1]}`;
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
