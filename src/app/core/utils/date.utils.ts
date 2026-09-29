/**
 * Devuelve el año actual a partir de una fecha de referencia.
 */
export function getCurrentYear(referenceDate: Date = new Date()): number {
  return referenceDate.getFullYear();
}

/**
 * Construye un rango serializado `inicio:fin` usado por filtros históricos.
 */
export function buildYearRange(
  startYear: number,
  endYear: number = getCurrentYear()
): string {
  return `${startYear}:${endYear}`;
}

/**
 * Construye un rango relativo hacia atrás desde el año de referencia.
 */
export function buildPastYearRange(
  maxYearsAgo: number,
  minYearsAgo: number,
  referenceDate: Date = new Date()
): string {
  const currentYear = getCurrentYear(referenceDate);
  return buildYearRange(currentYear - maxYearsAgo, currentYear - minYearsAgo);
}

/**
 * Extrae el año de una fecha válida o retorna `null` si no puede parsearla.
 */
export function extractYear(value: unknown): number | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(`${value}`);
  const time = date.getTime();

  return Number.isNaN(time) ? null : date.getFullYear();
}

/**
 * Indica si el valor puede interpretarse como fecha válida.
 */
export function hasValidDateValue(value: unknown): boolean {
  return extractYear(value) !== null;
}
