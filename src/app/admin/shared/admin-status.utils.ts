export type ActiveStatusSeverity = "success" | "danger";
export type PublicationStatusSeverity = "success" | "warning";

export function getActivationStatusLabel(isActive: boolean): string {
  return isActive ? "Activo" : "Inactivo";
}

export function getActivationStatusSeverity(
  isActive: boolean
): ActiveStatusSeverity {
  return isActive ? "success" : "danger";
}

export function getPublicationStatusLabel(isPublic: boolean): string {
  return isPublic ? "Aprobado" : "No publicado";
}

export function getPublicationStatusSeverity(
  isPublic: boolean
): PublicationStatusSeverity {
  return isPublic ? "success" : "warning";
}

export function getPriorityActionClass(isPriority?: boolean): string {
  return isPriority === true ? "p-button-success" : "p-button-primary";
}

export function getPriorityActionLabel(isPriority?: boolean): string {
  return isPriority === true ? "Prioritario" : "Priorizar";
}

export function joinFullName(
  firstName?: string,
  lastName?: string,
  fallback = ""
): string {
  const fullName = [firstName || "", lastName || ""].join(" ").trim();
  return fullName || fallback;
}
