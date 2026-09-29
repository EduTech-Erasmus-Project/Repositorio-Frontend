import { AbstractControl } from "@angular/forms";

export function controlInvalid(
  control: AbstractControl | null | undefined,
  errorCode = "required"
): boolean {
  return !!control && control.hasError(errorCode) && (control.touched || control.dirty);
}

export function normalizeTrimmedText(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeUppercaseText(value: unknown): string {
  return normalizeTrimmedText(value).toUpperCase();
}

export function hasTextValue(value: unknown): boolean {
  return normalizeTrimmedText(value).length > 0;
}

export function toEntityId<T extends { id?: number }>(
  value: T | number | null | undefined
): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    return value.id ?? null;
  }

  return null;
}

export function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const errorRecord = error as {
    error?: Record<string, unknown> | string | null;
    message?: string;
  };

  if (typeof errorRecord.error === "string" && errorRecord.error.trim().length > 0) {
    return errorRecord.error;
  }

  if (errorRecord.error && typeof errorRecord.error === "object") {
    const nestedError = Object.values(errorRecord.error).find(
      (value) => Array.isArray(value) && value.length > 0
    );

    if (Array.isArray(nestedError) && nestedError[0]) {
      return String(nestedError[0]);
    }

    const detail = errorRecord.error["detail"];
    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail;
    }

    const message = errorRecord.error["message"];
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  if (typeof errorRecord.message === "string" && errorRecord.message.trim().length > 0) {
    return errorRecord.message;
  }

  return fallback;
}
