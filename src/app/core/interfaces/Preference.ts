/**
 * Preferencia de accesibilidad o afinidad usada por filtros y perfil alumno.
 */
export interface Preference {
  id?: number;
  description?: string;
  code?: number;
  name?: string;
  search_value?: string;
}
