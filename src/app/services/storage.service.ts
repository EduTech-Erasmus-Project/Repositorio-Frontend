import { Injectable } from "@angular/core";
import { safeJsonParse } from "../core/utils/json.utils";

@Injectable({
  providedIn: 'root'
})
/**
 * Abstraccion minima de almacenamiento local para datos no sensibles.
 *
 * Se usa para persistir preferencias de UI y referencias locales de
 * interaccion. No debe usarse para tokens, secretos ni estado autentico de
 * sesion.
 */
export class StorageService {
  constructor() {}

  /**
   * Serializa un valor en JSON antes de guardarlo en `localStorage`.
   */
  saveLocalItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Recupera y parsea un valor previamente persistido.
   */
  getLocalItem<T>(key: string): T | null {
    const storageValue = localStorage.getItem(key);

    if (storageValue) {
      return safeJsonParse<T | null>(storageValue, null) as T;
    }

    return null;
  }

  /**
   * Elimina un valor persistido del almacenamiento local.
   */
  removeLocalItem(key: string): void {
    localStorage.removeItem(key);
  }
}
