import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { LoginService } from "../services/login.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  async canActivate(){
    let promiseLoged = await this.loginService
      .isLoged()
      .then(res => res)
      .catch(err => {
        this.router.navigateByUrl('/login');
        return err;
      });
    return promiseLoged as boolean;
  }
}
