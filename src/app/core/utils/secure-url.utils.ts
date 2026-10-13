/**
 * Evita el bloqueo por Mixed Content al embeber recursos del backend.
 *
 * Algunos OAs quedaron guardados con URLs `http://`. Si la pagina se sirve por
 * HTTPS, el navegador bloquea esos iframes, asi que se reescribe el esquema a
 * `https:`. Un iframe `http://` en pagina HTTPS falla siempre, por lo que el
 * cambio nunca empeora el resultado. Las URLs relativas o con otros esquemas
 * se devuelven sin cambios.
 */
export function upgradeToHttpsIfPageIsSecure(
  url: string | null | undefined,
  pageProtocol: string | undefined = typeof window !== "undefined"
    ? window.location?.protocol
    : undefined
): string {
  if (!url) {
    return url ?? "";
  }

  if (pageProtocol !== "https:" || !/^http:\/\//i.test(url)) {
    return url;
  }

  return "https://" + url.slice("http://".length);
}
