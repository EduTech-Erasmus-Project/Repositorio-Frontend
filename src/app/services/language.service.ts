import { Injectable , EventEmitter} from "@angular/core";
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as moment from 'moment';
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  
  constructor(
    private translateService: TranslateService,
    private storageService: StorageService
    ) {
    translateService.addLangs(["es", "en"]);
    translateService.setDefaultLang("es");
    moment.locale('es-us'); 
    translateService.use((this.storageService.getCookieItem('lenguaje') != null && this.storageService.getCookieItem('lenguaje') === 'en')? 'en':'es');
    translateService.onLangChange.subscribe((translate: LangChangeEvent) => {
      console.log(translate)
      
    })
  }

  get translate(): TranslateService {
    return this.translateService;
  }

  get momentjs(){
    return moment;
  }

  public setTranslate(code:string){
    this.translateService.use(code);
  }



}
