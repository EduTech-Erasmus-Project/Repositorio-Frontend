import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { AcademicDegreeLevel, ProfileLinkType, ProfileVisibilityField } from "src/app/core/interfaces/PublicProfile";

/**
 * Limites del perfil publico; los mismos que valida el backend
 * (`OwnPublicProfileSerializer` y modelos `PublicProfile`, `UserLink`,
 * `AcademicDegree`).
 */
export const PUBLIC_PROFILE_LIMITS = {
  headline: 120,
  faculty: 150,
  bio: 600,
  researchGroup: 150,
  researchLines: 5,
  researchLine: 60,
  subjects: 10,
  subject: 100,
  linkUrl: 300,
  degrees: 10,
  degreeText: 200,
  minYear: 1950,
} as const;

/** Orden en que se ofrecen los tipos de enlace; uno de cada tipo. */
export const PROFILE_LINK_TYPES: ProfileLinkType[] = [
  "orcid",
  "scholar",
  "scopus",
  "researchgate",
  "linkedin",
  "institutional",
  "website",
];

/** Mismo orden que el backend: de menor a mayor. */
export const ACADEMIC_DEGREE_LEVELS: AcademicDegreeLevel[] = ["technical", "third", "specialty", "master", "phd"];

/** Campos con visibilidad propia ("Publico" / "Solo yo"). */
export const PROFILE_VISIBILITY_FIELDS: ProfileVisibilityField[] = [
  "headline",
  "faculty",
  "bio",
  "research_lines",
  "subjects",
  "research_group",
];

/** Dominio esperado por tipo; `scholar` se valida aparte (cambia el dominio por pais). */
const LINK_DOMAINS: Partial<Record<ProfileLinkType, string>> = {
  orcid: "orcid.org",
  scopus: "scopus.com",
  researchgate: "researchgate.net",
  linkedin: "linkedin.com",
};
const SCHOLAR_HOST = /^scholar\.google\.[a-z.]+$/;
/** El ultimo caracter es el digito de control y puede ser X (tambien en minuscula). */
const ORCID_PATH = /^\/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])\/?$/i;

/**
 * Digito de control de un ORCID (ISO 7064 Mod 11-2, como lo publica ORCID):
 * detecta un digito mal escrito o dos intercambiados sin consultar orcid.org.
 */
export function isValidOrcidChecksum(orcid: string): boolean {
  const digits = orcid.replace(/-/g, "").toUpperCase();
  let total = 0;
  for (const digit of digits.slice(0, -1)) {
    total = (total + Number(digit)) * 2;
  }
  const result = (12 - (total % 11)) % 11;
  return digits.slice(-1) === (result === 10 ? "X" : String(result));
}

/** Guarda la X final del ORCID en mayuscula; el resto de enlaces queda igual. */
export function normalizeProfileLinkUrl(type: ProfileLinkType, url: string): string {
  const trimmed = url.trim();
  if (type !== "orcid") {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    const match = ORCID_PATH.exec(parsed.pathname);
    if (match) {
      parsed.pathname = `/${match[1].toUpperCase()}`;
      return parsed.toString();
    }
  } catch {
    // URL invalida: la validacion ya la marca.
  }
  return trimmed;
}

/**
 * Valida la URL de un enlace segun su tipo, como el backend: `https://`,
 * dominio por tipo (o subdominio) y formato de ORCID. Va en el control `url`
 * (asi se pinta en rojo como los demas campos) y lee `type` del grupo; al
 * cambiar el tipo hay que revalidar la URL.
 */
export const profileLinkUrlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const type = control.parent?.get("type")?.value as ProfileLinkType | null;
  const rawUrl = String(control.value ?? "").trim();
  if (!type || !rawUrl) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { https: true };
  }
  if (url.protocol !== "https:") {
    return { https: true };
  }

  const host = url.hostname.toLowerCase();
  if (type === "scholar" && !SCHOLAR_HOST.test(host)) {
    return { domain: { domain: "scholar.google" } };
  }
  const domain = LINK_DOMAINS[type];
  if (domain && host !== domain && !host.endsWith(`.${domain}`)) {
    return { domain: { domain } };
  }
  if (type === "orcid") {
    const match = ORCID_PATH.exec(url.pathname);
    if (!match) {
      return { orcid: true };
    }
    if (!isValidOrcidChecksum(match[1])) {
      return { orcidChecksum: true };
    }
  }
  return null;
};

/**
 * Anio opcional entre 1950 y el anio actual.
 */
export const degreeYearValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as number | null;
  if (value === null || value === undefined || (value as unknown) === "") {
    return null;
  }
  const max = new Date().getFullYear();
  const min = PUBLIC_PROFILE_LIMITS.minYear;
  return Number.isInteger(value) && value >= min && value <= max ? null : { year: { min, max } };
};
