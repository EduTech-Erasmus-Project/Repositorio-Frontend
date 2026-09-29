import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AdminComponent } from "src/app/admin/admin.component";
import { LoginService } from "src/app/services/login.service";
import { AdminMenuItem } from "./admin-menu-item.model";

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.css"],
    standalone: false
})
/**
 * Sidebar administrativo compartido.
 *
 * Construye el arbol de navegacion segun el rol del usuario y mantiene
 * sincronizada la rama expandida con la ruta actual del router.
 */
export class MenuComponent implements OnInit {
  model: AdminMenuItem[] = [];
  currentUrl = "";

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    public appMain: AdminComponent,
    public loginService: LoginService,
    private router: Router
  ) {}

  /**
   * Construye la variante correcta del menu administrativo y la sincroniza con la ruta actual.
   */
  ngOnInit() {
    this.buildMenuModel();
    this.syncExpandedState();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.syncExpandedState();
      });
  }

  /**
   * Marca el click dentro del sidebar para que el shell no lo cierre al propagar el evento.
   */
  onMenuClick(): void {
    this.appMain.menuClick = true;
  }

  hasChildren(item: AdminMenuItem): boolean {
    return !!item.items?.length;
  }

  isSidebarExpanded(): boolean {
    return this.appMain.staticMenuActive || this.appMain.sidebarActive || this.appMain.isMobile();
  }

  isItemExpanded(item: AdminMenuItem): boolean {
    return !!item.expanded;
  }

  isItemCurrent(item: AdminMenuItem): boolean {
    return this.itemMatchesRoute(item, this.currentUrl);
  }

  getCollapsedTitle(item: AdminMenuItem): string | null {
    return this.isSidebarExpanded() ? null : item.label ?? null;
  }

  /**
   * Expande o colapsa un grupo raiz, cerrando el resto para mantener una sola rama abierta.
   */
  toggleGroup(item: AdminMenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.onMenuClick();

    if (!this.hasChildren(item)) {
      return;
    }

    const shouldExpand = !item.expanded;
    this.model = this.model.map((candidate) => ({
      ...candidate,
      expanded: candidate === item ? shouldExpand : false,
    }));
  }

  /**
   * Ejecuta la salida comun despues de navegar desde el menu.
   */
  onItemNavigate(): void {
    this.handleNavigation();
  }

  /**
   * Selecciona el arbol de menu segun los roles del usuario autenticado.
   */
  private buildMenuModel(): void {
    const roles = this.loginService.user?.roles ?? [];
    this.model = roles.includes("superuser")
      ? this.buildSuperuserMenu()
      : this.buildLimitedAdminMenu();
  }

  private buildSuperuserMenu(): AdminMenuItem[] {
    return [
      this.createRootLinkItem("Inicio", "pi pi-home", ["/admin/home"]),
      this.createRootGroupItem("Objeto de aprendizaje", "pi pi-book", "/admin/learning-object", [
        this.createLeafItem("OA pendientes", ["/admin/learning-object/pending"]),
        this.createLeafItem("OA aprobados", ["/admin/learning-object/approved"])
      ]),
      this.createRootGroupItem("Docente", "pi pi-user", "/admin/teacher", [
        this.createLeafItem("Solicitudes pendientes", ["/admin/teacher/request/pending"]),
        this.createLeafItem("Solicitudes aprobadas", ["/admin/teacher/request/approved"])
      ]),
      this.createRootGroupItem("Experto", "pi pi-user-edit", "/admin/expert/request", [
        this.createLeafItem("Solicitudes pendientes", ["/admin/expert/request/pending"]),
        this.createLeafItem("Solicitudes aprobadas", ["/admin/expert/request/approved"])
      ]),
      this.createRootGroupItem("Estudiante", "pi pi-users", "/admin/student", [
        this.createLeafItem("Estudiantes", ["/admin/student"])
      ]),
      this.createRootGroupItem("Usuario administrador", "pi pi-id-card", "/admin/administrator", [
        this.createLeafItem("Registrar", ["/admin/administrator/register"]),
        this.createLeafItem("Listar", ["/admin/administrator/list"])
      ]),
      this.createRootGroupItem("Evaluación", "pi pi-check-square", [
        "/admin/expert/question",
        "/admin/expert/automatic",
        "/admin/expert/automatic-question",
        "/admin/expert/student"
      ], [
        this.createLeafItem("Experto", ["/admin/expert/question"]),
        this.createLeafItem("Automático", ["/admin/expert/automatic"]),
        this.createLeafItem("Estudiante", ["/admin/expert/student"])
      ]),
      this.createRootLinkItem("Reporte", "pi pi-file", ["/admin/report"]),
      this.createRootGroupItem("Configuraciones", "pi pi-cog", "/admin/config", [
        this.createLeafItem("Países", ["/admin/config/country"]),
        this.createLeafItem("Provincias", ["/admin/config/province"]),
        this.createLeafItem("Ciudades", ["/admin/config/city"]),
        this.createLeafItem("Universidades", ["/admin/config/university"]),
        this.createLeafItem("Campus", ["/admin/config/campus"]),
        this.createLeafItem("Correos", ["/admin/config/domain"]),
        this.createLeafItem("Servidor de correo", ["/admin/config/server"])
      ])
    ];
  }

  private buildLimitedAdminMenu(): AdminMenuItem[] {
    return [
      this.createRootLinkItem("Inicio", "pi pi-home", ["/admin/home"]),
      this.createRootGroupItem("Objeto de aprendizaje", "pi pi-book", "/admin/learning-object", [
        this.createLeafItem("OA pendientes", ["/admin/learning-object/pending"]),
        this.createLeafItem("OA aprobados", ["/admin/learning-object/approved"])
      ]),
      this.createRootGroupItem("Docente", "pi pi-user", "/admin/teacher", [
        this.createLeafItem("Solicitudes pendientes", ["/admin/teacher/request/pending"]),
        this.createLeafItem("Solicitudes aprobadas", ["/admin/teacher/request/approved"])
      ]),
      this.createRootGroupItem("Experto", "pi pi-user-edit", "/admin/expert/request", [
        this.createLeafItem("Solicitudes pendientes", ["/admin/expert/request/pending"]),
        this.createLeafItem("Solicitudes aprobadas", ["/admin/expert/request/approved"])
      ]),
      this.createRootGroupItem("Estudiante", "pi pi-users", "/admin/student", [
        this.createLeafItem("Estudiantes", ["/admin/student"])
      ]),
      this.createRootLinkItem("Reporte", "pi pi-file", ["/admin/report"])
    ];
  }

  private createRootLinkItem(label: string, icon: string, routerLink: string[]): AdminMenuItem {
    return {
      label,
      icon,
      routerLink,
      tooltip: label,
      tooltipOptions: {
        tooltipPosition: "right"
      },
      command: () => this.handleNavigation()
    };
  }

  private createRootGroupItem(
    label: string,
    icon: string,
    routePrefix: string | string[],
    items: AdminMenuItem[]
  ): AdminMenuItem {
    const routeMetadata = Array.isArray(routePrefix)
      ? { routePrefixes: routePrefix }
      : { routePrefix };

    return {
      label,
      icon,
      items,
      ...routeMetadata,
      tooltip: label,
      tooltipOptions: {
        tooltipPosition: "right"
      }
    };
  }

  private createLeafItem(label: string, routerLink: string[]): AdminMenuItem {
    return {
      label,
      routerLink,
      routerLinkActiveOptions: {
        exact: true
      },
      command: () => this.handleNavigation()
    };
  }

  /**
   * Cierra el sidebar movil para evitar que tape la nueva vista despues de navegar.
   */
  private handleNavigation(): void {
    if (this.appMain.isMobile()) {
      this.appMain.sidebarActive = false;
      this.appMain.menuMobileActive = false;
    }
  }

  /**
   * Recalcula la rama expandida usando la URL actual ya normalizada.
   */
  private syncExpandedState(): void {
    this.currentUrl = this.normalizeUrl(this.router.url);

    this.model = this.model.map((item) => ({
      ...item,
      expanded: this.itemMatchesRoute(item, this.currentUrl)
    }));
  }

  private itemMatchesRoute(item: AdminMenuItem, currentUrl: string): boolean {
    const itemRoute = this.normalizeRouterLink(item.routerLink);
    const itemRoutePrefixes = [
      ...(typeof item.routePrefix === "string" ? [item.routePrefix] : []),
      ...((item.routePrefixes ?? []).filter((prefix): prefix is string => typeof prefix === "string"))
    ].map((prefix) => this.normalizeUrl(prefix));

    if (itemRoute && (currentUrl === itemRoute || currentUrl.startsWith(`${itemRoute}/`))) {
      return true;
    }

    if (itemRoutePrefixes.some((prefix) => currentUrl === prefix || currentUrl.startsWith(`${prefix}/`))) {
      return true;
    }

    return !!item.items?.some((child) => this.itemMatchesRoute(child as AdminMenuItem, currentUrl));
  }

  /**
   * Convierte el `routerLink` de PrimeNG en una ruta comparable para el resaltado activo.
   */
  private normalizeRouterLink(routerLink: AdminMenuItem["routerLink"]): string | null {
    if (!routerLink) {
      return null;
    }

    if (Array.isArray(routerLink)) {
      return this.normalizeUrl(routerLink.join("/"));
    }

    if (typeof routerLink === "string") {
      return this.normalizeUrl(routerLink);
    }

    return null;
  }

  private normalizeUrl(url: string): string {
    const withoutQuery = url.split("?")[0].split("#")[0];
    const normalized = withoutQuery.replace(/\/+/g, "/");
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
}
