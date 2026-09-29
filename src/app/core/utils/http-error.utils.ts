/**
 * Extrae un mensaje usable desde errores HTTP o errores runtime simples.
 */
export function getHttpErrorMessage(
  error: unknown,
  fallback = "Error inesperado"
): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: string;
      error?: {
        message?: string;
      };
    };

    return candidate.error?.message || candidate.message || fallback;
  }

  return fallback;
}
