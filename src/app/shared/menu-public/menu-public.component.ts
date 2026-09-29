import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { NavigationEnd, NavigationExtras, Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { filter, firstValueFrom } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PublicComponent } from "../../public/public.component";
import { LanguageService } from "../../services/language.service";
import { LoginService } from "../../services/login.service";

@Component({
    selector: "app-menu-public",
    templateUrl: "./menu-public.component.html",
    styleUrls: ["./menu-public.component.scss"],
    standalone: false
})
/**
 * Orquesta la navegacion publica compartida, incluyendo enlaces base,
 * opciones adicionales por rol autenticado y comportamiento del menu movil.
 */
export class MenuPublicComponent implements OnInit {
  public tieredItems: MenuItem[] = [];
  public role_name = "";
  public mobileMenuOpen = false;

  private baseMenuItems: MenuItem[] = [];
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    public appMain: PublicComponent,
    private languageService: LanguageService,
    public loginService: LoginService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    if (
      this.loginService.user?.administrator ||
      this.loginService.validateRole("superuser")
    ) {
      this.router.navigateByUrl("/admin");
    }
  }

  ngOnInit(): void {
    void this.initializeMenuState();

    this.loginService.characterLogin$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res === true && this.loginService.user?.roles?.length) {
          this.role_name = this.getRolePrefix(this.loginService.user.roles[0]);
          void this.syncMenuItems();
        } else if (res === false) {
          this.role_name = "";
          void this.syncMenuItems();
        }
        this.cdr.detectChanges();
      });

    if (this.loginService.user?.roles?.length) {
      this.role_name = this.getRolePrefix(this.loginService.user.roles[0]);
    }

    this.loginService.characterMenu$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.syncMenuItems();
        this.cdr.detectChanges();
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.mobileMenuOpen = false;
        this.appMain.activeTopbarItem = null;
      });
  }

  /**
   * Sincroniza el estado inicial del menu despues de una recarga completa,
   * incluyendo la rehidratacion de sesion cuando el usuario ya estaba logeado.
   */
  private async initializeMenuState(): Promise<void> {
    await Promise.all([
      this.loadMenu(),
      this.loginService.bootstrapSession(),
    ]);

    if (this.loginService.user?.roles?.length) {
      this.role_name = this.getRolePrefix(this.loginService.user.roles[0]);
    }

    await this.syncMenuItems();
    this.cdr.detectChanges();
  }

  /**
   * Devuelve el prefijo corto usado junto al nombre visible del usuario.
   */
  getRolePrefix(role: string): string {
    switch (role) {
      case "teacher":
        return "Prof.";
      case "expert":
        return "Exp.";
      case "student":
        return "Est.";
      default:
        return "";
    }
  }

  /**
   * Construye las opciones base siempre visibles del menu publico.
   */
  async loadMenu() {
    const [
      homeLabel,
      aboutUsLabel,
      contactLabel,
      searchLabel,
      userGuideLabel,
    ] = await Promise.all([
      this.translateLabel("menu.home"),
      this.translateLabel("menu.aboutUs"),
      this.translateLabel("menu.contact"),
      this.translateLabel("menu.search"),
      this.translateLabel("menu.userGuide"),
    ]);

    this.baseMenuItems = [
      {
        label: homeLabel,
        routerLink: "/",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: aboutUsLabel,
        routerLink: "about-us",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: contactLabel,
        routerLink: "contact",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: searchLabel,
        routerLink: "search",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: userGuideLabel,
        routerLink: "guide/eXeLearning",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
    ];

    await this.syncMenuItems();
  }

  logOut() {
    this.closeMobileMenu();
    this.loginService.signOut();
  }

  navigate(route: string) {
    this.closeMobileMenu();
    this.router.navigate([route]);
  }

  navigateExpert(route: string) {
    this.closeMobileMenu();
    const extras: NavigationExtras = {
      queryParams: {
        is_evaluated: "False",
      },
    };

    this.router.navigate([route], extras);
  }

  navigateStudent() {
    this.closeMobileMenu();
    this.router.navigate(["recommended"]);
  }

  toggleMobileMenu(event: Event): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.appMain.activeTopbarItem = null;
    }
    event.preventDefault();
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.appMain.activeTopbarItem = null;
  }

  get roleTeacher() {
    return this.loginService.validateRole("teacher");
  }

  get roleStudent() {
    return this.loginService.validateRole("student");
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  private async syncMenuItems() {
    if (!this.baseMenuItems.length) {
      return;
    }

    const teacherItems = this.roleTeacher
      ? await this.buildTeacherMenuItems()
      : [];
    const studentItems = this.roleStudent
      ? await this.buildStudentMenuItems()
      : [];
    const expertItems = this.roleExpert
      ? await this.buildExpertMenuItems()
      : [];

    this.tieredItems = [
      ...this.baseMenuItems,
      ...studentItems,
      ...teacherItems,
      ...expertItems,
    ];
  }

  /**
   * Agrega accesos principales del estudiante sin duplicar todo el menu de perfil.
   */
  private async buildStudentMenuItems(): Promise<MenuItem[]> {
    const [recommendedLabel, ratedByMeLabel] = await Promise.all([
      this.translateLabel("menu.recommended"),
      this.translateLabel("menu.sideMenu.ratedMe"),
    ]);

    return [
      {
        label: recommendedLabel,
        routerLink: "/recommended",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: ratedByMeLabel,
        routerLink: "/settings/objects-qualified",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
    ];
  }

  /**
   * Agrega las entradas privadas de docente cuando el usuario autenticado
   * puede gestionar sus propios objetos de aprendizaje.
   */
  private async buildTeacherMenuItems(): Promise<MenuItem[]> {
    const [myOAsLabel, uploadOAsLabel] = await Promise.all([
      this.translateLabel("menu.myOAs"),
      this.translateLabel("menu.uploadOAs"),
    ]);

    return [
      {
        label: myOAsLabel,
        routerLink: "/settings/my-objects",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: uploadOAsLabel,
        routerLink: "/settings/new-object",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
    ];
  }

  /**
   * Agrega las entradas privadas del experto para calificar y revisar
   * objetos ya evaluados desde la capa publica autenticada.
   */
  private async buildExpertMenuItems(): Promise<MenuItem[]> {
    const [qualificateOaLabel, qualifiedOaLabel] = await Promise.all([
      this.translateLabel("menu.sideMenu.qualificateOa"),
      this.translateLabel("menu.sideMenu.OAQualificate"),
    ]);

    return [
      {
        label: qualificateOaLabel,
        routerLink: "search",
        queryParams: {
          is_evaluated: "False",
        },
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: qualifiedOaLabel,
        routerLink: "/settings/objects-qualified",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
    ];
  }

  private translateLabel(key: string): Promise<string> {
    return firstValueFrom(this.languageService.translate.get(key));
  }
}
