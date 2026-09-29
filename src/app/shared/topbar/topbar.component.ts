import { Component } from "@angular/core";
import { AdminComponent } from "src/app/admin/admin.component";
import { LoginService } from "src/app/services/login.service";

@Component({
    selector: "app-topbar",
    templateUrl: "./topbar.component.html",
    styleUrls: ["./topbar.component.css"],
    standalone: false
})
/**
 * Shell superior compartido del area administrativa.
 *
 * Expone la identidad del usuario autenticado y delega en `AdminComponent`
 * la apertura del menu lateral y del panel de perfil.
 */
export class TopbarComponent {
  readonly profileRoute = ["/admin/profile"];

  constructor(
    public appMain: AdminComponent,
    public loginService: LoginService
  ) {}

  /**
   * Devuelve el nombre visible del usuario con un fallback seguro para sesiones parciales.
   */
  get userFullName(): string {
    const firstName = this.loginService.user?.first_name ?? "";
    const lastName = this.loginService.user?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Usuario";
  }

  get userPrimaryRole(): string {
    return (this.loginService.user?.roles?.[0] ?? "").toUpperCase();
  }

  get userEmail(): string {
    return this.loginService.user?.email ?? "";
  }

  get userImage(): string {
    return this.loginService.user?.image || "assets/img/noimage.png";
  }

  /**
   * Cierra la sesion delegando el flujo al servicio de autenticacion.
   */
  logOut(): void {
    this.loginService.signOut();
  }

  onTopbarRegionClick(event: Event): void {
    this.appMain.topbarItemClick = true;
    event.stopPropagation();
  }
}
