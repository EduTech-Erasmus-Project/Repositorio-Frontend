import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { LoginService } from "../services/login.service";
import { canActivateWithRoles } from "./role-guard.utils";

@Injectable({
  providedIn: "root",
})
/**
 * Permite el acceso solo a usuarios con rol `expert`.
 */
export class ExpertGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): Promise<boolean> {
    return canActivateWithRoles(this.loginService, this.router, ["expert"]);
  }
}
