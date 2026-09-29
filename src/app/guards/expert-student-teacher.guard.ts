import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { LoginService } from "../services/login.service";
import { canActivateWithRoles } from "./role-guard.utils";

@Injectable({
  providedIn: "root",
})
/**
 * Habilita rutas compartidas entre experto, estudiante y docente.
 */
export class ExpertAndStudentGuardAndTeacher implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): Promise<boolean> {
    return canActivateWithRoles(this.loginService, this.router, [
      "expert",
      "student",
      "teacher",
    ]);
  }
}
