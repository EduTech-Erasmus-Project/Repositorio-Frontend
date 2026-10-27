import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { ManagedUserLearningObject, ManagedUserSummary } from "src/app/core/interfaces/api-contracts";
import { AuthorProfileCardData } from "src/app/shared/author-profile-card/author-profile-card.component";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import {
  buildManagedAdminProfileBreadcrumbs,
  buildManagedAdminUploadDetailPath,
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
  /** Datos de la ficha del perfil publico; `null` si el docente no lo guardo. */
  public publicProfileCard: AuthorProfileCardData | null = null;
  public learningObjects: ManagedUserLearningObject[] = [];
  public readonly learningObjectsRowsOptions = [5, 10, 20, 50];
  /** Paneles del acordeon abiertos al cargar. */
  public openPanels: string[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private route: ActivatedRoute,
    private router: Router,
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

  public get publicProfile() {
    return this.user?.public_profile ?? null;
  }

  /**
   * Estado del rol mostrado; si el endpoint no trae `is_active`, se usa el
   * flujo desde el que se entro (pendiente o aprobado).
   */
  public get isApproved(): boolean {
    const role = this.adminRole === "expert" ? this.expert : this.teacher;
    return role?.is_active ?? this.status === "approved";
  }

  public get institution(): string {
    return [this.getCatalogName(this.user?.university), this.getCatalogName(this.user?.campus)]
      .filter(Boolean)
      .join(" · ");
  }

  public get publicLearningObjectsCount(): number {
    return this.learningObjects.filter((oa) => oa.public).length;
  }

  /** Detalle del OA dentro del admin (no suma vistas como la pagina publica). */
  public getLearningObjectLink(oa: ManagedUserLearningObject): string | null {
    return oa.slug ? buildManagedAdminUploadDetailPath(oa.slug) : null;
  }

  /** Clic en cualquier parte de la fila; el titulo es el enlace accesible por teclado. */
  public openLearningObject(oa: ManagedUserLearningObject): void {
    const link = this.getLearningObjectLink(oa);
    if (link) {
      void this.router.navigateByUrl(link);
    }
  }

  public getRoleLabelKey(role: string): string {
    return `adminTeacherProfile.roles.${role}`;
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
      this.publicProfileCard = this.buildPublicProfileCard();
      // Todos los OA del docente con sus totales; la tabla pagina en el cliente.
      this.learningObjects = this.user.learning_objects ?? [];
      this.openPanels = this.resolveOpenPanels();
    } catch {
      this.user = null;
      this.publicProfileCard = null;
      this.learningObjects = [];
      this.openPanels = [];
      this.rolesList = [];
      this.rolText = getManagedAdminRolesTitle(this.status, 0);
    } finally {
      this.isLoading = false;
      this.refreshView();
    }
  }

  /**
   * En solicitudes pendientes interesa revisar el perfil; en docentes
   * aprobados, sus OA. Si el panel preferido no existe, se abre el primero
   * que si se muestre; el perfil sin configurar solo se abre si no hay otro.
   */
  private resolveOpenPanels(): string[] {
    const available = [
      this.publicProfileCard ? "public-profile" : null,
      this.learningObjects.length ? "learning-objects" : null,
      this.expert ? "expert" : null,
    ].filter((panel): panel is string => panel !== null);
    const preferred = this.status === "pending"
      ? ["public-profile", "expert", "learning-objects"]
      : ["learning-objects", "public-profile", "expert"];
    const panel = preferred.find((item) => available.includes(item))
      ?? (this.teacher ? "public-profile" : undefined);
    return panel ? [panel] : [];
  }

  private getCatalogName(value: { name?: string } | number | null | undefined): string {
    return typeof value === "object" && value?.name ? value.name : "";
  }

  /**
   * Adapta `public_profile` a la ficha compartida. Las profesiones no se pasan
   * porque esta pantalla ya las muestra en "Informacion docente".
   */
  private buildPublicProfileCard(): AuthorProfileCardData | null {
    const profile = this.publicProfile;
    if (!this.teacher || !profile) {
      return null;
    }

    return {
      headline: profile.headline,
      faculty: profile.faculty,
      bio: profile.bio,
      research_lines: profile.research_lines,
      subjects: profile.subjects,
      research_group: profile.research_group,
      highest_degree: profile.highest_degree ?? undefined,
      links: profile.links,
      degrees: profile.degrees,
    };
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
