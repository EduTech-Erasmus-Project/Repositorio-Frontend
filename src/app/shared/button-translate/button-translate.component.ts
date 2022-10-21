import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { StorageService } from 'src/app/services/storage.service'
@Component({
  selector: 'app-button-translate',
  templateUrl: './button-translate.component.html',
  styleUrls: ['./button-translate.component.scss']
})
export class ButtonTranslateComponent implements OnInit {
  //title = 'angular-i18n-ngx-translate';
  public selectedLanguage = 'es';

  constructor(
    private languageService: LanguageService,
    private storageService: StorageService
  ) {
    this.selectedLanguage = (storageService.getCookieItem('lenguaje')==null)?'es':storageService.getCookieItem('lenguaje');
  }

  ngOnInit(): void {
    
  }
  
  selectLanguage(lang: string) {
    window.location.reload();
    this.languageService.setTranslate(lang);
    this.storageService.saveCookieItem('lenguaje',lang);
    
  }
}
