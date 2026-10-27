import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";
import { LoginService } from "../services/login.service";

/**
 * Pagina con un formulario que puede quedar con cambios sin guardar.
 */
export interface LeaveConfirmable {
  /** `true` si se puede salir; si hay cambios, pregunta antes. */
  confirmLeave(): boolean | Promise<boolean>;
}

@Injectable({
  providedIn: "root",
})
/**
 * Pide confirmacion antes de salir de una pagina con cambios sin guardar.
 * La pregunta la hace la propia pagina, que conoce su formulario. Si la
 * sesion ya se cerro (salir o sesion vencida) no pregunta: no hay como guardar.
 */
export class UnsavedChangesGuard implements CanDeactivate<LeaveConfirmable> {
  constructor(private loginService: LoginService) {}

  canDeactivate(component: LeaveConfirmable | null): boolean | Promise<boolean> {
    if (!this.loginService.user || !component?.confirmLeave) {
      return true;
    }
    return component.confirmLeave();
  }
}
