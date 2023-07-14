import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { tap, map, catchError } from "rxjs/operators";
import { StorageService } from "./storage.service";


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root",
})
export class TokenService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService //private loginService: LoginService
  ) {}

  validateToken(token: string) {
    let body = {
      token,
    };

    //console.log("metod validate ", body);

    return this.http.post(`${baseUrl}/token/verify/`, body).pipe(
      map((resp: any) => (resp?.detail ? false : true)),
      catchError((error) => of(false))
    );

  }

  refreshToken() {
    const data_ref = this.storageService.getCookieItem("data_ref");
    let body = {
      refresh: data_ref,
    };
    // return this.http.post(`${baseUrl}/token/refresh/`, body).pipe(
    //   tap((resp: any) => {
    //     //console.log("Token refresh in token servise", resp)
    //     this.storageService.saveCookieItem("data_acc", resp.access);
    //   }),
    //   map((resp) => true),
    //   catchError((error) => of(false))
    // );

    return this.http.post(`${baseUrl}/token/refresh/`, body).pipe(
      tap((token: any) => {
        this.storageService.saveCookieItem("data_acc", token.access);
      })
    );
  }
}
