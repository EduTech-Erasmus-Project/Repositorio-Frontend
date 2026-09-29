import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { LoginService } from "../services/login.service";

@Injectable({
  providedIn: "root",
})
/**
 * Restringe el shell administrativo a administradores y superusuarios.
 */
export class AdminGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    try {
      await this.loginService.isLoged();
    } catch {
      this.router.navigate(["/"]);
      return false;
    }

    const user = this.loginService.user;
    if (
      user &&
      ((user.administrator && user.administrator !== null) ||
        this.loginService.validateRole("superuser"))
    ) {
      return true;
    }

    this.router.navigate(["/"]);
    return false;
  }
}
