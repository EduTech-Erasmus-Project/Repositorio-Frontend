import { Injectable } from '@angular/core';
import { QuerySearch } from '../core/interfaces/Search';

export const DEFAULT_SEARCH_PAGE_SIZE = 15;

@Injectable({
  providedIn: 'root'
})
/**
 * Estado compartido y liviano de filtros de busqueda.
 *
 * Conserva los query params activos entre pantallas publicas que reutilizan la
 * misma experiencia de exploracion de objetos de aprendizaje.
 */
export class QuerySearchService {

  public queryParams: QuerySearch = {};
  /** Filas por pagina elegidas en la busqueda; se mantienen al cambiar de filtro. */
  public pageSize: number = DEFAULT_SEARCH_PAGE_SIZE;

  constructor() { }
}
