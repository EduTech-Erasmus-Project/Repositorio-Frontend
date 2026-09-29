const FILE_SIZE_UNITS = ["KB", "MB", "GB", "TB"] as const;

/**
 * Formatea tamaños de archivo para labels visibles del frontend.
 */
export function formatFileSize(size?: number | null): string {
  if (size === null || size === undefined || Number.isNaN(size)) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${FILE_SIZE_UNITS[unitIndex]}`;
}

/**
 * Genera nombres únicos para exportaciones descargables basadas en timestamp.
 */
export function buildTimestampedFileName(
  baseName: string,
  extension: string,
  timestamp: number = Date.now()
): string {
  const normalizedExtension = extension.startsWith(".")
    ? extension
    : `.${extension}`;

  return `${baseName}_${timestamp}${normalizedExtension}`;
}

/**
 * Descarga un `Blob` usando APIs nativas del navegador para evitar dependencias
 * externas solo dedicadas a guardar archivos.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}
