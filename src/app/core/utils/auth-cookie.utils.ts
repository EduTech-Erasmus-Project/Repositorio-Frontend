import { environment } from "../../../environments/environment";

const MUTABLE_HTTP_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const COOKIE_BOOTSTRAP_PATHS = ["/csrf/", "/login/", "/token/refresh/", "/logout/"];

/**
 * Determina si una request apunta al backend principal del frontend.
 */
export function isBackendApiRequest(
  url: string,
  baseUrl: string = environment.baseUrl
): boolean {
  return url.startsWith(baseUrl);
}

/**
 * Determina si la request usa un endpoint del nuevo flujo de sesion por cookie.
 */
export function isCookieSessionEndpoint(
  url: string,
  baseUrl: string = environment.baseUrl
): boolean {
  return COOKIE_BOOTSTRAP_PATHS.some((path) => url.startsWith(`${baseUrl}${path}`));
}

/**
 * Determina si la request puede requerir header CSRF al mutar estado.
 */
export function isMutableBackendRequest(
  method: string,
  url: string,
  baseUrl: string = environment.baseUrl
): boolean {
  return isBackendApiRequest(url, baseUrl) && MUTABLE_HTTP_METHODS.has(method.toUpperCase());
}

/**
 * Lee una cookie puntual desde `document.cookie`.
 */
export function readCookieValue(
  name: string,
  cookieSource?: string
): string | null {
  const source =
    cookieSource ?? (typeof document !== "undefined" ? document.cookie : "");

  if (!source) {
    return null;
  }

  const segments = source.split(";").map((segment) => segment.trim());
  const prefix = `${name}=`;
  const cookie = segments.find((segment) => segment.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}
