import { Router } from "@angular/router";
import { LoginService } from "../services/login.service";

/**
 * Evalua guards basados en roles del usuario autenticado y conserva una unica
 * redireccion a la home publica cuando el permiso no aplica.
 */
export async function canActivateWithRoles(
  loginService: LoginService,
  router: Router,
  allowedRoles: readonly string[]
): Promise<boolean> {
  try {
    await loginService.isLoged();
  } catch {
    router.navigate(["home"]);
    return false;
  }

  const isAllowed = allowedRoles.some((role) => loginService.validateRole(role));

  if (isAllowed) {
    return true;
  }

  router.navigate(["home"]);
  return false;
}
