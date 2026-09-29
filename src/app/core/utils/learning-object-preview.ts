type LearningObjectPreviewSource = {
  preview?: {
    mode?: string | null;
    toc?: unknown;
  } | null;
  learning_object_file?: {
    url?: string | null;
  } | null;
} | null | undefined;

/**
 * Detecta OA legacy cuyo archivo principal es HTML y todavía requiere inferir
 * el `imsmanifest.xml` para pintar menú lateral.
 */
export function isLegacyManifestCandidate(url?: string | null): boolean {
  if (!url) {
    return false;
  }

  const normalizedUrl = url.toLowerCase();
  return normalizedUrl.endsWith(".html") && normalizedUrl.indexOf("website_index.html") === -1;
}

/**
 * Decide si la UI debe mostrar el menú lateral de navegación del OA.
 */
export function shouldDisplayLearningObjectMenu(source: LearningObjectPreviewSource): boolean {
  const toc = source?.preview?.toc;
  const previewMode = (source?.preview?.mode || "").toLowerCase();

  if (Array.isArray(toc) && toc.length > 0) {
    return true;
  }

  if (previewMode === "html") {
    return false;
  }

  return isLegacyManifestCandidate(source?.learning_object_file?.url);
}

/**
 * Reconstruye la ruta esperada del `imsmanifest.xml` para paquetes legacy.
 */
export function buildLegacyManifestUrl(url?: string | null): string | null {
  if (!isLegacyManifestCandidate(url)) {
    return null;
  }

  try {
    const currentUrl = new URL(url);
    const currentPath = currentUrl.pathname;
    const separatorIndex = currentPath.lastIndexOf("/");
    const basePath = separatorIndex >= 0 ? currentPath.slice(0, separatorIndex + 1) : "/";
    currentUrl.pathname = `${basePath}imsmanifest.xml`;
    return currentUrl.toString();
  } catch {
    return null;
  }
}
