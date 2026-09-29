import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
/**
 * Fachada minima sobre `ngx-translate` para centralizar el idioma activo.
 *
 * Resuelve el idioma inicial desde almacenamiento local y expone un punto
 * unico para cambiarlo desde la UI compartida.
 */
export class LanguageService {

  constructor(
    private translateService: TranslateService,
    private storageService: StorageService
  ) {
    this.translateService.use(this.resolveInitialLanguage());
  }

  get translate(): TranslateService {
    return this.translateService;
  }

  /**
   * Cambia el idioma activo del frontend.
   */
  public setTranslate(code: string): void {
    this.translateService.use(code);
  }

  private resolveInitialLanguage(): "es" | "en" {
    return this.storageService.getLocalItem("lenguaje") === "en" ? "en" : "es";
  }
}
