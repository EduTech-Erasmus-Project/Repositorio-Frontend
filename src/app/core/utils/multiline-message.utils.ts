/**
 * Normaliza saltos de linea sin compactar el contenido escrito por el usuario.
 *
 * No usa `trim()` porque los espacios, tabulaciones y parrafos pueden ser
 * parte intencional del mensaje que se enviara por correo.
 */
export function normalizeMultilineMessage(value: unknown): string {
  return String(value ?? "").replace(/\r\n?/g, "\n");
}

