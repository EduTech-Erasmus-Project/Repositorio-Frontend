import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { ManagedUserSummary } from "src/app/core/interfaces/api-contracts";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import {
  buildManagedAdminProfileBreadcrumbs,
  getManagedAdminAvatarUrl,
  getManagedAdminProfileKicker,
  getManagedAdminRoles,
  getManagedAdminRolesTitle,
  ManagedAdminRole,
  ManagedAdminStatus,
  resolveManagedAdminRoleFromRoute,
} from "../../shared/admin-managed-user.utils";

/**
 * Presenta el perfil consolidado de una solicitud o usuario aprobado de tipo
 * docente, experto o combinado, segun el flujo administrativo desde el que se
 * accede.
 */
@Component({
  selector: "app-teacher-expert-profile",
  templateUrl: "./teacher-expert-profile.component.html",
  styleUrls: ["./teacher-expert-profile.component.css"],
  standalone: false,
})
export class TeacherExpertProfileComponent implements OnInit {
  public readonly id: number;
  public readonly status: ManagedAdminStatus;
  public readonly adminRole: ManagedAdminRole;

  public rolText = "";
  public user: ManagedUserSummary | null = null;
  public rolesList: string[] = [];
  public isLoading = true;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.id = Number(this.route.snapshot.params["id"]);
    this.status = this.route.snapshot.params["status"] as ManagedAdminStatus;
    this.adminRole = resolveManagedAdminRoleFromRoute(
      this.route.snapshot.routeConfig?.path
    );

    this.breadcrumbService.setItems(
      buildManagedAdminProfileBreadcrumbs(this.adminRole, this.status)
    );
  }

  ngOnInit(): void {
    void this.loadProfile();
  }

  public get expert() {
    return this.user?.collaboratingExpert ?? null;
  }

  public get teacher() {
    return this.user?.teacher ?? null;
  }

  public getAvatarUrl(): string | null {
    return getManagedAdminAvatarUrl(this.user);
  }

  /**
   * Devuelve el nombre visible del usuario, con fallback seguro para vistas
   * parciales o registros sin nombre completo.
   */
  public getUserFullName(): string {
    const firstName = this.user?.first_name?.trim?.() || "";
    const lastName = this.user?.last_name?.trim?.() || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Usuario";
  }

  /**
   * Construye iniciales de respaldo para el avatar cuando no existe imagen.
   */
  public getUserInitials(): string {
    const firstInitial = this.user?.first_name?.trim?.().charAt(0) || "";
    const lastInitial = this.user?.last_name?.trim?.().charAt(0) || "";
    const initials = `${firstInitial}${lastInitial}`.trim();

    if (initials) {
      return initials.toUpperCase();
    }

    return (this.user?.email?.charAt(0) || "U").toUpperCase();
  }

  public getProfileKicker(): string {
    return getManagedAdminProfileKicker(this.adminRole, this.status);
  }

  public getExternalUrl(url: string | null): string | null {
    if (!url) {
      return null;
    }

    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  /**
   * Carga el perfil desde el endpoint correcto segun estado aprobado o pendiente.
   */
  public async loadProfile(): Promise<void> {
    this.isLoading = true;
    this.refreshView();

    try {
      const response = await firstValueFrom(
        this.status === "pending"
          ? this.administratorService.getTeacherAndExpertToAproveProfile(this.id)
          : this.administratorService.getTeacherAndExpertprovedProfile(this.id)
      );

      this.user = response as ManagedUserSummary;
      this.rolesList = getManagedAdminRoles(this.user, this.status);
      this.rolText = getManagedAdminRolesTitle(this.status, this.rolesList.length);
    } catch {
      this.user = null;
      this.rolesList = [];
      this.rolText = getManagedAdminRolesTitle(this.status, 0);
    } finally {
      this.isLoading = false;
      this.refreshView();
    }
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
