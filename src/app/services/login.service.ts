import { EventEmitter, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.prod";
import { HttpClient } from "@angular/common/http";
import { Router, NavigationExtras } from "@angular/router";
import { StorageService } from "./storage.service";
import { TokenService } from "./token.service";
import { map } from "rxjs/operators";
import { CurrentUser } from "../core/interfaces/CurrentUser";

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root",
})
export class LoginService {
  private currUser: CurrentUser;
  characterMenu = new EventEmitter<boolean>();
  characterLogin = new EventEmitter<boolean>();
  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private tokenService: TokenService
  ) {
    this.currUser =
      (storageService.getCookieItem("current_user") as CurrentUser) || null;
    //console.log("current currUser", this.currUser)
  }

  set currentUser(currUser: CurrentUser) {
    //console.log("set current currUser", currUser);
    this.currUser = currUser;
    this.storageService.saveCookieItem("current_user", this.currUser as any);
  }
  get user() {
   
    return this.currUser;
  }

  signIn(formData: any) {
    return this.http.post(baseUrl + "/login/", formData);
  }

  signOut(): void {
    if(this.validateRole("teacher") == true){
      this.characterMenu.emit(false);
    }
    this.characterLogin.emit(false);
    this.storageService.removeCookieItem("current_user");
    //this.storageService.removeCookieItem('csrftoken');
    this.storageService.removeCookieItem("data_ref");
    this.storageService.removeCookieItem("data_acc");
    this.currUser = null;
    this.router.navigateByUrl("/");
    // this.router.navigate(["/"]).then(() => {
    //   window.location.reload();
    // });
  }

  validateUser(token: string) {
    return new Promise(async (resolve, reject) => {
      await this.http.get(baseUrl + "/user/").subscribe(
        (res: any) => {
          //console.log('res', res);
          this.storageService.saveCookieItem("current_user", res);
          this.currUser = this.storageService.getCookieItem(
            "current_user"
          ) as CurrentUser;
          //console.log("currUser saved", this.currUser);
          if (
            this.currUser.administrator !== null ||
            this.validateRole("superuser")
          ) {
            //console.log("validate super currUser", this.currUser.roles.includes('superuser'))
            this.router.navigate(["admin"]);
          } else {
            if (this.validateRole("student")) {
              this.characterLogin.emit(true);
              this.router.navigate(["recommended"]);
            }
            if (this.validateRole("teacher")) {
              this.characterLogin.emit(true);
              this.router.navigate(["settings/my-objects"]);
            }
            if (this.validateRole("expert")) {
              this.characterLogin.emit(true);
              let extras: NavigationExtras = {
                queryParams: {
                  is_evaluated: "False",
                },
              };
              this.router.navigate(["search"], extras);
            }
            //this.router.navigate(["/"]);
          }

          resolve(true);
        },
        (error) => {
          resolve(error);
        }
      );
    });
    //return this.http.get(baseUrl + "/currUser/", { headers }); //.pipe(map((data: any) => data)); observe: "response"
  }

  isLoged() {
    return new Promise(async (resolve, reject) => {
      let tokenData = this.storageService.getCookieItem("data_ref");
      let current_user: any = this.storageService.getCookieItem("current_user");
      if (tokenData && current_user) {
        this.tokenService.validateToken(tokenData).subscribe((res) => {
          if (res) {
            resolve(true);
          } else {
            reject(false);
          }
        });
      } else {
        reject(false);
      }
    });
  }

  validateRole(role: string): boolean {
    if (this.currUser) {
      if (this.currUser.roles?.includes(role)) {
        return true;
      } else {
        return false;
      }
    } else {
      false;
    }
  }

  signOutPass(): void {
    this.storageService.removeCookieItem("current_user");
    //this.storageService.removeCookieItem('csrftoken');
    this.storageService.removeCookieItem("data_ref");
    this.storageService.removeCookieItem("data_acc");
    this.currUser = null;
    this.router.navigateByUrl("/login");
    // this.router.navigate(["/"]).then(() => {
    //   window.location.reload();
    // });
  }

  resetPass(data: any) {
    let aux = new FormData();
    aux.append("email", data);

   // console.log("ser", data);
    return this.http.post(baseUrl + "/request-reset-email/", aux);
  }

  changePassword(data: FormData, id: number) {
    return this.http.put(baseUrl + `/user/change_password/${id}/`, data).pipe(map((data: any) => data));
  }

  resetPassToken(data : FormData){
    return this.http.patch(baseUrl+`/password-reset-complete/`,data).pipe(map((data: any) => data));
  }
}
