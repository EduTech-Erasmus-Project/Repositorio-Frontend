import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from "crypto-js";
import { environment } from '../../environments/environment.prod';

const secretKey = environment.cryptoSecretKey;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  saveCookieItem(key: string, value: string) {
    let data = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      secretKey
    ).toString();
    //console.log("Value",data)
    //this.cookieService.set(key, data);
    localStorage.setItem(key, data);
  }

  getCookieItem(key: string): string {
    //let cookieValue = this.cookieService.get(key);
    let storageValue = localStorage.getItem(key);

    if(storageValue){
      let bytes = CryptoJS.AES.decrypt(storageValue, secretKey);
      let originalText = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return originalText;
    }else{
      return null;
    }
  }

  removeCookieItem(key: string): void {
    //this.cookieService.delete(key);
    localStorage.removeItem(key);
  }

  
}
