import {
  buildLearningObjectEvaluationBreadcrumbs,
  buildManagedAdminListBreadcrumb,
  buildManagedAdminProfilePath,
  getManagedAdminProfileKicker,
  getManagedAdminRolesTitle,
} from "./admin-managed-user.utils";
import {
  getActivationStatusLabel,
  getActivationStatusSeverity,
  getPriorityActionClass,
  getPriorityActionLabel,
  getPublicationStatusLabel,
  getPublicationStatusSeverity,
  joinFullName,
} from "./admin-status.utils";
import {
  getDomainBackendType,
  getDomainDescriptionCode,
  getDomainRouteLabel,
  getRegisterOptionLabel,
  getRegisterOptionValue,
  isDomainRouteType,
} from "./email-domain.utils";

describe("admin shared utils", () => {
  it("resolves activation and publication status labels", () => {
    expect(getActivationStatusLabel(true)).toBe("Activo");
    expect(getActivationStatusSeverity(false)).toBe("danger");
    expect(getPublicationStatusLabel(true)).toBe("Aprobado");
    expect(getPublicationStatusSeverity(false)).toBe("warning");
  });

  it("resolves shared badges and full names", () => {
    expect(getPriorityActionClass(true)).toBe("p-button-success");
    expect(getPriorityActionLabel(false)).toBe("Priorizar");
    expect(joinFullName("Ana", "Perez")).toBe("Ana Perez");
    expect(joinFullName("", "", "Usuario")).toBe("Usuario");
  });

  it("builds managed admin labels and routes", () => {
    expect(buildManagedAdminListBreadcrumb("expert", "approved")).toEqual({
      label: "Expertos aprobados",
      routerLink: ["/admin/expert/request/approved"],
    });
    expect(buildManagedAdminProfilePath("teacher", 8, "pending")).toBe(
      "/admin/teacher/request/pending/teacher-expert-profile/8/pending"
    );
    expect(getManagedAdminProfileKicker("expert", "pending")).toBe(
      "Solicitud de experto"
    );
    expect(getManagedAdminRolesTitle("approved", 2)).toBe("Roles aprobados");
  });

  it("builds learning object evaluation breadcrumbs", () => {
    expect(buildLearningObjectEvaluationBreadcrumbs(12, "student")[1]).toEqual({
      label: "Objetos de aprendizaje calificados por estudiantes",
      routerLink: ["/admin/learning-object/qualified-student", 12],
    });
  });

  it("maps domain route values and register options", () => {
    expect(isDomainRouteType("profesor")).toBeTrue();
    expect(getDomainRouteLabel("experto")).toBe("Experto");
    expect(getDomainBackendType("estudiante")).toBe("STUDENT");
    expect(getDomainDescriptionCode("profesor")).toBe("TEACHER");
    expect(getRegisterOptionLabel("ALL")).toBe("TODOS");
    expect(getRegisterOptionValue("SOLO")).toBe("ONLY");
  });
});
