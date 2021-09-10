import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { StorageService } from "../services/storage.service";
import { LoginService } from "../services/login.service";

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}
  canActivate(): boolean {
    //console.log("admin guard")
    if (this.loginService.user) {
      if (
        (this.loginService.user.administrator &&
          this.loginService.user.administrator !== null) ||
        this.loginService.validateRole("superuser")
      ) {
        return true;
      } else {
        this.router.navigate(["/"]);
        return false;
      }
    } else {
      this.router.navigate(["/"]);
      return false;
    }
  }
}
