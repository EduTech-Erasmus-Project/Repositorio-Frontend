function unwrapEventValue(value: unknown): unknown {
  if (value && typeof value === "object") {
    const eventValue = value as { value?: unknown; target?: { value?: unknown } };
    return eventValue.value ?? eventValue.target?.value ?? value;
  }

  return value;
}

/**
 * Convierte un valor genérico a número finito o `null` si no es válido.
 */
export function coerceFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

/**
 * Convierte un valor a número positivo o `null` si no cumple el contrato.
 */
export function coercePositiveNumber(value: unknown): number | null {
  const parsedValue = coerceFiniteNumber(value);
  return parsedValue !== null && parsedValue > 0 ? parsedValue : null;
}

/**
 * Extrae un `id` relacional desde un primitivo o desde un objeto `{ id }`.
 */
export function coerceRelationId(value: unknown): number | null {
  const rawValue =
    value && typeof value === "object" && "id" in (value as object)
      ? (value as { id?: unknown }).id
      : value;

  return coercePositiveNumber(rawValue);
}

/**
 * Extrae un id relacional desde eventos DOM/PrimeNG con forma `{ value }`.
 */
export function coerceEventRelationId(value: unknown): number | null {
  return coerceRelationId(unwrapEventValue(value));
}
