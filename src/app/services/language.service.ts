import { Injectable } from "@angular/core";
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as moment from 'moment';

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  
  constructor(private translateService: TranslateService) {
    translateService.addLangs(["es", "en"]);
    translateService.setDefaultLang("es");
    moment.locale('es-us'); 

    //const browserLang = translateService.getBrowserLang();
    //translateService.use(browserLang.match(/es|en/) ? browserLang : "es");
    translateService.use("es");

    translateService.onLangChange.subscribe((translate: LangChangeEvent) => {
      //console.log("event change lenguage")
    })
  }

  get translate(): TranslateService {
    return this.translateService;
  }

  get momentjs(){
    return moment;
  }

}
