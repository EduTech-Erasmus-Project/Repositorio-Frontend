import { Injectable } from '@angular/core';
import { QuerySearch } from '../core/interfaces/Search';

@Injectable({
  providedIn: 'root'
})
export class QuerySearchService {

  public queryParams: QuerySearch = {};

  constructor() { }
}
