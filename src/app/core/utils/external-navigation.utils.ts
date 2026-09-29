import { environment } from "../../../environments/environment";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const DEV_LOCAL_HOSTS = ["localhost", "127.0.0.1"] as const;

function tryParseUrl(value: string, base?: string): URL | null {
  try {
    return base ? new URL(value, base) : new URL(value);
  } catch {
    return null;
  }
}

function getCurrentOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "http://localhost";
}

function collectAllowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const currentOrigin = getCurrentOrigin();

  const registerHost = (urlLike?: string | null) => {
    if (!urlLike) {
      return;
    }

    const parsed = tryParseUrl(urlLike, currentOrigin);
    if (!parsed?.hostname) {
      return;
    }

    hosts.add(parsed.hostname.toLowerCase());
  };

  registerHost(currentOrigin);
  registerHost(environment.baseUrl);
  registerHost(environment.oerUrl);

  for (const host of DEV_LOCAL_HOSTS) {
    hosts.add(host);
  }

  return hosts;
}

/**
 * Valida una URL externa antes de abrirla por script.
 *
 * Reglas:
 * - solo `http` y `https`
 * - host dentro de la allowlist del sistema
 * - soporta rutas relativas resolviendolas contra el origen actual
 */
export function resolveTrustedExternalUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl?.trim()) {
    return null;
  }

  const resolved = tryParseUrl(rawUrl.trim(), getCurrentOrigin());
  if (!resolved) {
    return null;
  }

  if (!ALLOWED_PROTOCOLS.has(resolved.protocol)) {
    return null;
  }

  const allowedHosts = collectAllowedHosts();
  if (!allowedHosts.has(resolved.hostname.toLowerCase())) {
    return null;
  }

  return resolved.href;
}

/**
 * Abre una URL externa endureciendo la apertura frente a `window.opener`.
 */
export function openTrustedExternalUrl(
  rawUrl: string | null | undefined,
  opener: Pick<Window, "open"> = window
): boolean {
  const resolvedUrl = resolveTrustedExternalUrl(rawUrl);

  if (!resolvedUrl) {
    return false;
  }

  opener.open(resolvedUrl, "_blank", "noopener,noreferrer");
  return true;
}
