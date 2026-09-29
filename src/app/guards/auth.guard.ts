import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { LoginService } from "../services/login.service";

@Injectable({
  providedIn: "root",
})
/**
 * Protege rutas privadas que requieren una sesión persistida válida.
 */
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    try {
      return await this.loginService.isLoged();
    } catch {
      await this.router.navigateByUrl("/login");
      return false;
    }
  }
}
