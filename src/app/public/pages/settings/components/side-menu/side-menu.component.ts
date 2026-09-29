import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { MenuItem } from "primeng/api";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "../../../../../services/login.service";
import { translateInstant } from "src/app/core/utils/i18n.utils";

/**
 * Construye el menu lateral del area `settings` segun los roles activos del usuario.
 *
 * Responsabilidades:
 * - Publicar las rutas habilitadas para estudiante, docente y experto.
 * - Rehidratar labels traducidos cuando cambia el idioma.
 * - Delegar el cierre de sesion al servicio de autenticacion.
 */
@Component({
    selector: "app-side-menu",
    templateUrl: "./side-menu.component.html",
    styleUrls: ["./side-menu.component.scss"],
    standalone: false
})
export class SideMenuComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  public items: MenuItem[] = [];

  constructor(
    private loginService: LoginService,
    private languageService:LanguageService,
    private cdr: ChangeDetectorRef
    ) {}

  ngOnInit(): void {
    this.rebuildMenu();
    this.languageService.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.rebuildMenu();
        this.cdr.detectChanges();
      });
  }

  /**
   * Cierra la sesion actual desde la opcion final del menu lateral.
   */
  signOut(): void {
    this.loginService.signOut();
  }

  /**
   * Reconstruye el arbol completo de opciones visibles segun los roles activos.
   */
  private rebuildMenu(): void {
    const items = this.buildBaseItems();

    if (this.loginService.validateRole("student")) {
      this.appendStudentItems(items);
    }

    if (this.loginService.validateRole("teacher")) {
      this.appendTeacherItems(items);
    }

    if (this.loginService.validateRole("expert")) {
      this.appendExpertItems(items);
    }

    this.appendExitItem(items);
    this.items = items;
  }

  private buildBaseItems(): MenuItem[] {
    return [
      {
        label: translateInstant(this.languageService.translate, "menu.sideMenu.myAccount", "Mi perfil"),
        icon: "pi pi-fw pi-user-edit",
        routerLink: "profile",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
      },
      {
        label: translateInstant(this.languageService.translate, "menu.sideMenu.security", "Seguridad"),
        icon: "pi pi-fw pi-key",
        routerLink: "security",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
      },
    ];
  }

  private appendStudentItems(items: MenuItem[]): void {
    items.push(this.buildMenuRouteItem(
      translateInstant(this.languageService.translate, "menu.sideMenu.ratedMe", "Calificados por mi"),
      "pi pi-fw pi-check",
      "objects-qualified"
    ));

    items.push(this.buildMenuRouteItem(
      translateInstant(this.languageService.translate, "recommended.viewed", "Vistos por mi"),
      "pi pi-fw pi-list",
      "my-views"
    ));
  }

  private appendTeacherItems(items: MenuItem[]): void {
    items.push(this.buildMenuRouteItem(
      translateInstant(this.languageService.translate, "menu.sideMenu.myObjectsA", "Mis Objetos de aprendizaje"),
      "pi pi-fw pi-list",
      "my-objects"
    ));

    items.push(this.buildMenuRouteItem(
      translateInstant(this.languageService.translate, "menu.sideMenu.uploadOA", "Subir Objeto de aprendizaje"),
      "pi pi-fw pi-upload",
      "new-object"
    ));
  }

  private appendExpertItems(items: MenuItem[]): void {
    items.push(this.buildMenuRouteItem(
      translateInstant(this.languageService.translate, "menu.sideMenu.OAQualificate", "Objetos calificados"),
      "pi pi-fw pi-check",
      "objects-qualified"
    ));
  }

  private appendExitItem(items: MenuItem[]): void {
    items.push(
      {
        separator: true,
      },
      {
        label: translateInstant(this.languageService.translate, "menu.sideMenu.exit", "Salir"),
        icon: "pi pi-fw pi-power-off",
        command: () => {
          this.signOut();
        },
      }
    );
  }

  private buildMenuRouteItem(label: string, icon: string, routerLink: string): MenuItem {
    return {
      label,
      icon,
      routerLink,
      routerLinkActiveOptions: {
        exact: true,
        styleClass: "router-active",
      },
    };
  }
}
