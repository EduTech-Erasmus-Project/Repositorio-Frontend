/**
 * Convierte objetos del frontend a `FormData` sin depender de librerias
 * CommonJS externas.
 *
 * Reglas:
 * - escalares: `campo`
 * - arreglos: `campo[]`
 * - objetos anidados: `padre[hijo]`
 */
export function objectToFormData(
  value: Record<string, unknown>,
  formData: FormData = new FormData(),
  parentKey?: string
): FormData {
  Object.entries(value).forEach(([key, entryValue]) => {
    appendFormDataValue(formData, buildFormDataKey(parentKey, key), entryValue);
  });

  return formData;
}

function appendFormDataValue(
  formData: FormData,
  key: string,
  value: unknown
): void {
  if (value === null || value === undefined) {
    return;
  }

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (value instanceof Date) {
    formData.append(key, value.toISOString());
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      appendFormDataValue(formData, `${key}[]`, item);
    });
    return;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormDataValue(formData, buildFormDataKey(key, childKey), childValue);
    });
    return;
  }

  formData.append(key, String(value));
}

function buildFormDataKey(parentKey: string | undefined, key: string): string {
  return parentKey ? `${parentKey}[${key}]` : key;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Blob) &&
    !(value instanceof Date)
  );
}
