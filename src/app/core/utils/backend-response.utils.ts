import {
  ApiCursorPaginatedResponse,
  ApiPaginatedResponse,
} from "../interfaces/api-contracts";

export interface LegacyValueCountResponse<T> {
  Count?: number | string | null;
  value?: T[] | null;
}

export interface ApiDataArrayResponse<T> {
  data?: T[] | null;
}

/**
 * Unión tolerante de colecciones backend que hoy conviven en el proyecto.
 */
export type CollectionResponse<T> =
  | T[]
  | ApiPaginatedResponse<T>
  | ApiCursorPaginatedResponse<T>
  | LegacyValueCountResponse<T>
  | ApiDataArrayResponse<T>
  | null
  | undefined;

export interface NormalizedCollectionResponse<T> {
  items: T[];
  total: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface CollectionResponseShape<T> {
  count?: number | string | null;
  Count?: number | string | null;
  next?: string | null;
  previous?: string | null;
  links?: {
    next?: string | null;
    previous?: string | null;
  } | null;
  results?: T[] | null;
  value?: T[] | null;
  data?: T[] | null;
}

/**
 * Convierte respuestas heterogéneas del backend a una estructura única.
 */
export function normalizeCollectionResponse<T>(
  response: CollectionResponse<T>
): NormalizedCollectionResponse<T> {
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const items = getResponseItems(response);
  const total = getResponseTotal(response, items.length);
  const shape = response as CollectionResponseShape<T> | null | undefined;

  return {
    items,
    total,
    hasPreviousPage: hasLinkValue(shape?.previous) || hasLinkValue(shape?.links?.previous),
    hasNextPage: hasLinkValue(shape?.next) || hasLinkValue(shape?.links?.next),
  };
}

/**
 * Resuelve la colección real priorizando `results`, `value` y `data`.
 */
function getResponseItems<T>(response: CollectionResponse<T>): T[] {
  if (!response || Array.isArray(response)) {
    return [];
  }

  const shape = response as CollectionResponseShape<T>;

  if (Array.isArray(shape.results)) {
    return shape.results;
  }

  if (Array.isArray(shape.value)) {
    return shape.value;
  }

  if (Array.isArray(shape.data)) {
    return shape.data;
  }

  return [];
}

/**
 * Resuelve el total explícito cuando el backend lo informa; si no, usa el
 * tamaño de la colección ya normalizada.
 */
function getResponseTotal<T>(
  response: CollectionResponse<T>,
  fallback: number
): number {
  if (!response || Array.isArray(response)) {
    return fallback;
  }

  const shape = response as CollectionResponseShape<T>;
  const explicitTotal = Number(shape.count ?? shape.Count);
  return Number.isFinite(explicitTotal) && explicitTotal >= 0
    ? explicitTotal
    : fallback;
}

/**
 * Determina si un enlace de paginación representa realmente otra página.
 */
function hasLinkValue(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}
