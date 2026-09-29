import { MenuItem } from "primeng/api";

/**
 * Contrato base del menu administrativo compartido.
 *
 * Extiende `MenuItem` con metadata que el shell usa para:
 * - marcar rutas activas por prefijo
 * - construir grupos anidados de forma tipada
 * - conservar flags visuales del sidebar
 */
export interface AdminMenuItem extends MenuItem {
  items?: AdminMenuItem[];
  routePrefix?: string;
  routePrefixes?: string[];
  expanded?: boolean;
}
