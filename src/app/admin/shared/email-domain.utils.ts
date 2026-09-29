import { DomainBackendType } from "src/app/core/interfaces/api-contracts";

export type DomainRouteType = "profesor" | "experto" | "estudiante";
export type RegisterOptionType = "ALL" | "ONLY" | "EXCEPT";
export type RegisterOptionLabel = "TODOS" | "SOLO" | "EXCEPTO";

const DOMAIN_ROLE_CONFIG: Record<
  DomainRouteType,
  { label: string; backendType: DomainBackendType; description: DomainBackendType }
> = {
  profesor: {
    label: "Profesor",
    backendType: "TEACHER",
    description: "TEACHER",
  },
  experto: {
    label: "Experto",
    backendType: "EXPERT",
    description: "EXPERT",
  },
  estudiante: {
    label: "Estudiante",
    backendType: "STUDENT",
    description: "STUDENT",
  },
};

const REGISTER_OPTION_LABELS: Record<RegisterOptionType, RegisterOptionLabel> = {
  ALL: "TODOS",
  ONLY: "SOLO",
  EXCEPT: "EXCEPTO",
};

export function isDomainRouteType(value: unknown): value is DomainRouteType {
  return value === "profesor" || value === "experto" || value === "estudiante";
}

export function getDomainRouteLabel(value: DomainRouteType): string {
  return DOMAIN_ROLE_CONFIG[value].label;
}

export function getDomainBackendType(
  value: DomainRouteType
): DomainBackendType {
  return DOMAIN_ROLE_CONFIG[value].backendType;
}

export function getDomainDescriptionCode(
  value: DomainRouteType
): DomainBackendType {
  return DOMAIN_ROLE_CONFIG[value].description;
}

export function getRegisterOptionLabel(value: string): string {
  if (value === "ALL" || value === "ONLY" || value === "EXCEPT") {
    return REGISTER_OPTION_LABELS[value];
  }

  return value;
}

export function getRegisterOptionValue(value: string): string {
  const option = (Object.entries(REGISTER_OPTION_LABELS) as Array<
    [RegisterOptionType, RegisterOptionLabel]
  >).find(([, label]) => label === value);

  return option?.[0] || value;
}
