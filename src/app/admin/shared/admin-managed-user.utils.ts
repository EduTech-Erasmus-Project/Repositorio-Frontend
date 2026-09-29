import { ManagedUserSummary } from "src/app/core/interfaces/api-contracts";

export type ManagedAdminRole = "teacher" | "expert";
export type ManagedAdminStatus = "pending" | "approved";
export type LearningObjectEvaluationRole = "student" | "expert";

interface BreadcrumbItem {
  label: string;
  routerLink?: Array<string | number>;
}

export function resolveManagedAdminRoleFromRoute(
  routePath?: string | null
): ManagedAdminRole {
  return routePath?.startsWith("expert/request") ? "expert" : "teacher";
}

export function getManagedAdminListLabel(
  role: ManagedAdminRole,
  status: ManagedAdminStatus
): string {
  if (role === "expert") {
    return status === "pending" ? "Expertos por aprobar" : "Expertos aprobados";
  }

  return status === "pending" ? "Docentes por aprobar" : "Docentes aprobados";
}

export function getManagedAdminListPath(
  role: ManagedAdminRole,
  status: ManagedAdminStatus
): string {
  return `/admin/${role}/request/${status}`;
}

export function buildManagedAdminListBreadcrumb(
  role: ManagedAdminRole,
  status: ManagedAdminStatus
): BreadcrumbItem {
  return {
    label: getManagedAdminListLabel(role, status),
    routerLink: [getManagedAdminListPath(role, status)],
  };
}

export function buildManagedAdminProfilePath(
  role: ManagedAdminRole,
  id: number,
  status: ManagedAdminStatus
): string {
  return `${getManagedAdminListPath(role, status)}/teacher-expert-profile/${id}/${status}`;
}

export function buildManagedAdminEvaluatedPath(
  role: ManagedAdminRole,
  id: number
): string {
  return `${getManagedAdminListPath(role, "approved")}/learning-object/evaluated/${id}`;
}

export function buildManagedAdminUploadPath(id: number): string {
  return `${getManagedAdminListPath("teacher", "approved")}/learning-object/upload/${id}`;
}

export function buildManagedAdminUploadDetailPath(slug: string): string {
  return `${getManagedAdminListPath("teacher", "approved")}/learning-object/upload/detail/${slug}`;
}

export function buildManagedAdminEvaluatedDetailPath(
  role: ManagedAdminRole,
  id: number,
  slug: string
): string {
  return `${buildManagedAdminEvaluatedPath(role, id)}/detail/${slug}`;
}

export function buildManagedAdminProfileBreadcrumbs(
  role: ManagedAdminRole,
  status: ManagedAdminStatus
): BreadcrumbItem[] {
  return [buildManagedAdminListBreadcrumb(role, status), { label: "Perfil" }];
}

export function getManagedAdminProfileKicker(
  role: ManagedAdminRole,
  status: ManagedAdminStatus
): string {
  if (status === "pending") {
    return role === "expert" ? "Solicitud de experto" : "Solicitud de docente";
  }

  return role === "expert" ? "Perfil de experto" : "Perfil de docente";
}

export function getManagedAdminRolesTitle(
  status: ManagedAdminStatus,
  rolesCount: number
): string {
  if (status === "pending") {
    return rolesCount > 1
      ? "Roles solicitados por el usuario"
      : "Rol solicitado por el usuario";
  }

  return rolesCount > 1 ? "Roles aprobados" : "Rol aprobado";
}

export function getManagedAdminRoles(
  user: ManagedUserSummary,
  status: ManagedAdminStatus
): string[] {
  const requestedRoles = user.rol_solicitados || [];
  if (status === "pending" && requestedRoles.length > 0) {
    return requestedRoles;
  }

  const approvedRoles = user.rol_aprovados || user.rol_aprobados || user.roles || [];
  if (status === "approved" && approvedRoles.length > 0) {
    return approvedRoles;
  }

  const fallbackRoles: string[] = [];

  if (user.teacher) {
    fallbackRoles.push("teacher");
  }

  if (user.collaboratingExpert) {
    fallbackRoles.push("expert");
  }

  return fallbackRoles;
}

export function getManagedAdminAvatarUrl(
  user: ManagedUserSummary | null | undefined
): string | null {
  const imageUrl = typeof user?.image_url === "string" ? user.image_url.trim() : "";
  if (imageUrl) {
    return imageUrl;
  }

  const image = typeof user?.image === "string" ? user.image.trim() : "";
  return image || null;
}

export function isManagedTeacherActive(user: ManagedUserSummary): boolean {
  const teacher = user.teacher;
  return Boolean(teacher && (teacher.is_active ?? teacher.teacher_is_active));
}

export function isManagedExpertActive(user: ManagedUserSummary): boolean {
  const expert = user.collaboratingExpert;
  return Boolean(expert && (expert.is_active ?? expert.expert_is_active));
}

export function buildLearningObjectEvaluationBreadcrumbs(
  id: number,
  role: LearningObjectEvaluationRole
): BreadcrumbItem[] {
  return [
    {
      label: "Objetos de aprendizaje aprobados",
      routerLink: ["/admin/learning-object/approved"],
    },
    {
      label:
        role === "expert"
          ? "Objetos de aprendizaje calificados por expertos"
          : "Objetos de aprendizaje calificados por estudiantes",
      routerLink: [
        role === "expert"
          ? "/admin/learning-object/qualified-expert"
          : "/admin/learning-object/qualified-student",
        id,
      ],
    },
    { label: "Detalle de evaluaciones" },
  ];
}

export function buildManagedLearningObjectListBreadcrumbs(
  role: ManagedAdminRole,
  kind: "evaluated" | "uploaded"
): BreadcrumbItem[] {
  return [
    buildManagedAdminListBreadcrumb(role, "approved"),
    {
      label:
        kind === "evaluated"
          ? "Objetos de aprendizaje evaluados"
          : "Objetos de aprendizaje cargados",
    },
  ];
}
