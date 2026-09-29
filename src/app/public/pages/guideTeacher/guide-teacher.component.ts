import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { filter } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "app-guide-teacher",
    templateUrl: "./guide-teacher.component.html",
    styleUrls: ["./guide-teacher.component.scss"],
    standalone: false
})
/**
 * Shell de la guía pública para el perfil docente.
 *
 * Responsabilidades:
 * - Mantener el stepper del flujo docente.
 * - Sincronizar breadcrumb y ruta hija activa.
 * - Redirigir al selector de perfiles cuando el usuario quiere reiniciar la guía.
 */
export class GuideTeacherComponent implements OnInit {
  public items: MenuItem[] = [];
  private path = "uploadfile";
  private readonly destroyRef = inject(DestroyRef);
  public activeIndex: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {
    this.path = this.route.snapshot.firstChild?.url?.[0]?.path || this.path;
  }

  ngOnInit(): void {
    this.addItems();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.syncRouteState();
      });

    this.syncRouteState();
  }

  /**
   * Construye los pasos navegables de la guía docente.
   */
  private addItems(): void {
    this.items = [
      {
        label: this.getTranslation("buttons.uploadOa"),
        routerLink: "uploadfile",
      },
      {
        label: this.getTranslation("buttons.uploadOaOer"),
        routerLink: "uploadfile-adapted",
      },
      {
        label: this.getTranslation("buttons.viewMyOa"),
        routerLink: "my-objects",
      },
    ];

    this.syncActiveIndex();
    this.addBreadcrumb();
  }

  private syncActiveIndex(): void {
    const currentIndex = this.items.findIndex(
      (item) => item.routerLink === this.path
    );

    this.activeIndex = currentIndex >= 0 ? currentIndex : 0;
  }

  /**
   * Publica el breadcrumb visible de la guía docente.
   */
  private addBreadcrumb(): void {
    const rootLabel = this.getTranslation("menu.teacherGuide");
    const step = this.items[this.activeIndex];
    const breadcrumbItems: MenuItem[] = [
      { label: rootLabel, routerLink: ["/guideTeacher/uploadfile"] },
    ];

    if (step?.label) {
      breadcrumbItems.push({
        label: String(step.label),
        routerLink: [`/guideTeacher/${step.routerLink}`],
      });
    }

    this.breadcrumbService.setItems(breadcrumbItems);
  }

  /**
   * Recalcula el shell cuando cambia la ruta hija activa.
   */
  private syncRouteState(): void {
    this.path = this.route.snapshot.firstChild?.url?.[0]?.path || this.path;
    this.syncActiveIndex();
    this.addBreadcrumb();
  }

  private getTranslation(key: string): string {
    const translated = this.languageService.translate.instant(key);
    return translated && translated !== key ? translated : key;
  }

  public prevPage() {
    if (!this.items.length || this.activeIndex === 0) {
      return;
    }

    this.activeIndex -= 1;
    this.router.navigate([`/guideTeacher/${this.items[this.activeIndex].routerLink}`]);
  }

  public nextPage() {
    if (!this.items.length || this.activeIndex >= this.items.length - 1) {
      return;
    }

    this.activeIndex += 1;
    this.router.navigate([`/guideTeacher/${this.items[this.activeIndex].routerLink}`]);
  }

  public goToStep(index: number): void {
    const step = this.items[index];

    if (!step || index === this.activeIndex) {
      return;
    }

    this.activeIndex = index;
    void this.router.navigate([`/guideTeacher/${step.routerLink}`]);
  }

  public resetPage(): void {
    void this.router.navigate(["/guide/registration-profile"]);
  }

  public get currentStepLabel(): string {
    return this.items[this.activeIndex]?.label || "";
  }
}
