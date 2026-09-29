/**
 * Normaliza valores desconocidos a texto seguro para render.
 */
export function normalizeText(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) {
    return fallback;
  }

  const textValue = `${value}`.trim();
  return textValue === "" ? fallback : textValue;
}

/**
 * Indica si un valor desconocido contiene texto útil tras normalización.
 */
export function hasText(value: unknown): boolean {
  return normalizeText(value, "") !== "";
}
