import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { LoginService } from "../services/login.service";

@Injectable({
  providedIn: "root",
})
/**
 * Evita mostrar login o registro cuando ya existe una sesión activa.
 */
export class CheckLoginGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    try {
      const hasSession = await this.loginService.bootstrapSession();
      if (!hasSession) {
        return true;
      }

      await this.router.navigateByUrl("/");
      return false;
    } catch {
      return true;
    }
  }
}
