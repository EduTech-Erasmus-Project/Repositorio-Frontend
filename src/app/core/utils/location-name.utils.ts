/**
 * Normaliza un nombre geografico para compararlo: minusculas, sin tildes y con
 * espacios simples.
 *
 * Replica `normalize_name` del comando `normalize_user_location` del backend,
 * para que el frontend reconozca los mismos nombres al precargar un perfil.
 */
export function normalizeLocationName(value: unknown): string {
  return `${value ?? ""}`
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

/**
 * Nombres normalizados de una entrada del catalogo: `name`, `native` y todas
 * sus traducciones. Es el mismo criterio de coincidencia que usa el backend.
 */
export function locationEntryNames(entry: {
  name?: string | null;
  native?: string | null;
  translations?: Record<string, string> | null;
}): Set<string> {
  const names = new Set<string>(
    [entry.name, entry.native, ...Object.values(entry.translations ?? {})].map(
      normalizeLocationName
    )
  );
  names.delete("");
  return names;
}
