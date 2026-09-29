/**
 * Parse seguro para valores JSON persistidos en storage o respuestas técnicas.
 */
export function safeJsonParse<T>(
  value: string | null | undefined,
  fallback: T
): T {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
