import { Injectable } from '@angular/core';
import { QuerySearch } from '../core/interfaces/Search';

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

  constructor() { }
}
