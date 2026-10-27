import { ObjectLearning } from "./ObjectLearning";

/**
 * Contratos del perfil publico del docente (`/user/public-profile/` y
 * `/authors/<user_key>/`). Ver `docs/features/perfil-publico-autor-plan.md`.
 */

export type ProfileVisibility = "public" | "private";

/**
 * Campos opcionales cuya visibilidad decide el docente ("Publico" / "Solo yo").
 */
export type ProfileVisibilityField =
  | "headline"
  | "faculty"
  | "bio"
  | "research_lines"
  | "subjects"
  | "research_group";

export type ProfileFieldVisibility = Record<ProfileVisibilityField, ProfileVisibility>;

export type ProfileLinkType =
  | "orcid"
  | "scholar"
  | "scopus"
  | "researchgate"
  | "linkedin"
  | "institutional"
  | "website";

/** Niveles de educacion superior del backend (`AcademicDegree.LEVELS`), de menor a mayor. */
export type AcademicDegreeLevel = "technical" | "third" | "specialty" | "master" | "phd";

export interface ProfileLink {
  type: ProfileLinkType;
  url: string;
  order?: number;
  is_visible?: boolean;
}

export interface AcademicDegree {
  level: AcademicDegreeLevel;
  title: string;
  institution: string;
  year?: number | null;
  is_visible?: boolean;
}

/**
 * Perfil propio: trae todo, tambien lo marcado como "Solo yo".
 * Es tambien el formato de `public_profile` en el detalle del admin.
 */
export interface OwnPublicProfile {
  user_key: string;
  is_public: boolean;
  headline: string;
  faculty: string;
  bio: string;
  research_lines: string[];
  subjects: string[];
  research_group: string;
  field_visibility: ProfileFieldVisibility;
  highest_degree: AcademicDegreeLevel | null;
  links: ProfileLink[];
  degrees: AcademicDegree[];
}

/**
 * Cuerpo de `PUT`/`PATCH`. `field_visibility` se mezcla con lo guardado;
 * `links` y `degrees`, si vienen, reemplazan la lista completa.
 */
export type OwnPublicProfileUpdate = Partial<
  Omit<OwnPublicProfile, "user_key" | "highest_degree" | "field_visibility">
> & {
  field_visibility?: Partial<ProfileFieldVisibility>;
};

export interface NamedCatalogItem {
  id: number;
  name: string;
}

export interface PublicProfession {
  id: number;
  description: string;
}

export interface PublicKnowledgeArea {
  id: number;
  name_es: string;
  name_en: string;
}

/**
 * Perfil publico de un docente. Los campos opcionales solo vienen si el
 * docente los marco como "Publico" y no estan vacios.
 */
export interface PublicAuthor {
  user_key: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string | null;
  university: NamedCatalogItem | null;
  campus: NamedCatalogItem | null;
  professions: PublicProfession[];
  knowledge_areas: PublicKnowledgeArea[];
  member_since: number;
  highest_degree?: AcademicDegreeLevel;
  headline?: string;
  faculty?: string;
  bio?: string;
  research_lines?: string[];
  subjects?: string[];
  research_group?: string;
  links: Pick<ProfileLink, "type" | "url">[];
  degrees: Omit<AcademicDegree, "is_visible">[];
}

/**
 * Card de OA en la grilla del autor: la card del buscador mas sus totales.
 */
export interface AuthorLearningObject extends ObjectLearning {
  views: number;
  downloads: number;
}
