import { Component } from '@angular/core';
import { LanguageService } from 'src/app/services/language.service';
import { StorageService } from 'src/app/services/storage.service';

/**
 * Selector de idioma compartido para la capa publica, persistiendo la eleccion
 * del usuario en cookie antes de recargar la aplicacion.
 */
@Component({
    selector: 'app-button-translate',
    templateUrl: './button-translate.component.html',
    styleUrls: ['./button-translate.component.scss'],
    standalone: false
})
export class ButtonTranslateComponent {
  private static readonly LANGUAGE_COOKIE_KEY = 'lenguaje';
  public selectedLanguage = 'es';

  constructor(
    private languageService: LanguageService,
    private storageService: StorageService
  ) {
    this.selectedLanguage =
      storageService.getLocalItem(ButtonTranslateComponent.LANGUAGE_COOKIE_KEY) ?? 'es';
  }
  
  selectLanguage(lang: string) {
    if (lang === this.selectedLanguage) {
      return;
    }

    this.selectedLanguage = lang;
    this.languageService.setTranslate(lang);
    this.storageService.saveLocalItem(ButtonTranslateComponent.LANGUAGE_COOKIE_KEY, lang);
    this.reloadPage();
  }

  reloadPage() {
    window.location.reload();
  }
}
