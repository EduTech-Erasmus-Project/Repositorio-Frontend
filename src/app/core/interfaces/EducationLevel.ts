/**
 * Nivel educativo disponible para clasificación y filtros del OA.
 */
export interface EducationLevel {
    id?: number;
    name?: string;
    description?: string;
    code?: number;
    /** Nivel CINE 2011 (0 a 8); el catalogo llega ordenado por este codigo. */
    isced_code?: number | null;
    /** Edad tipica del nivel; el formulario del OA la propone como rango de edad. */
    typical_age_min?: number | null;
    /** `null` = sin limite superior. */
    typical_age_max?: number | null;
  }
