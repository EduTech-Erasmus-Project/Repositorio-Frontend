import { Component } from "@angular/core";
import { CurrentUser } from "src/app/core/interfaces/CurrentUser";
import { LoginService } from "../../../services/login.service";

/**
 * Shell principal del area de configuracion del usuario autenticado.
 *
 * Responsabilidades:
 * - Mostrar el resumen corto del usuario actual sobre las subrutas de `settings`.
 * - Componer el layout comun entre el menu lateral y el `router-outlet` interno.
 * - Exponer fallbacks seguros para nombre y avatar cuando la sesion aun no trae
 *   todos los datos del perfil.
 */
@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"],
    standalone: false
})
export class SettingsComponent {
  private readonly fallbackAvatarPath = "assets/img/noimage.png";

  constructor(public loginService: LoginService) {}

  get currentUser(): CurrentUser | null {
    return this.loginService.user;
  }

  get displayName(): string {
    const firstName = this.currentUser?.first_name?.trim() || "";
    const lastName = this.currentUser?.last_name?.trim() || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Usuario";
  }

  get profileImage(): string {
    return this.currentUser?.image || this.fallbackAvatarPath;
  }
}
