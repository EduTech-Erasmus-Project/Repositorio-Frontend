import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { upgradeToHttpsIfPageIsSecure } from '../../core/utils/secure-url.utils';

@Pipe({
    name: 'sanitizerurl',
    standalone: false
})
export class UrlSanitizerPipe implements PipeTransform {

  constructor(private domSanitizer:DomSanitizer){

  }

  transform(url:string ):SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(upgradeToHttpsIfPageIsSecure(url));
  }
}
