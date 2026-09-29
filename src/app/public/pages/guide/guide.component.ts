import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { filter } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "app-guide",
    templateUrl: "./guide.component.html",
    styleUrls: ["./guide.component.scss"],
    standalone: false
})
/**
 * Shell de la guía pública general.
 *
 * Responsabilidades:
 * - Exponer la navegación paso a paso de la guía base.
 * - Mantener sincronizados stepper, breadcrumb y ruta hija activa.
 * - Resolver los labels traducidos que usa la navegación de la guía.
 */
export class GuideComponent implements OnInit {
  public items: MenuItem[] = [];
  private path = "eXeLearning";
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
   * Construye el stepper de la guía pública principal con labels traducidos.
   */
  private addItems(): void {
    this.items = [
      {
        label: "eXeLearning",
        routerLink: "eXeLearning",
      },
      {
        label: this.getTranslation("buttons.introduction"),
        routerLink: "introduction",
      },
      {
        label: this.getTranslation("buttons.searchOa"),
        routerLink: "search-public",
      },
      {
        label: this.getTranslation("buttons.profileRegister"),
        routerLink: "registration-profile",
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
   * Publica el breadcrumb visible de la guía tomando la ruta hija activa.
   */
  private addBreadcrumb(): void {
    const rootLabel = this.getTranslation("menu.userGuide");
    const step = this.items[this.activeIndex];
    const breadcrumbItems: MenuItem[] = [
      { label: rootLabel, routerLink: ["/guide"] },
    ];

    if (step?.label) {
      breadcrumbItems.push({
        label: String(step.label),
        routerLink: [`/guide/${step.routerLink}`],
      });
    }

    this.breadcrumbService.setItems(breadcrumbItems);
  }

  /**
   * Recalcula el estado del shell cuando cambia la ruta hija de la guía.
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
    this.router.navigate([`/guide/${this.items[this.activeIndex].routerLink}`]);
  }

  public nextPage() {
    if (!this.items.length || this.activeIndex >= this.items.length - 1) {
      return;
    }

    this.activeIndex += 1;
    this.router.navigate([`/guide/${this.items[this.activeIndex].routerLink}`]);
  }

  public goToStep(index: number): void {
    const step = this.items[index];

    if (!step || index === this.activeIndex) {
      return;
    }

    this.activeIndex = index;
    void this.router.navigate([`/guide/${step.routerLink}`]);
  }

  public get currentStepLabel(): string {
    return this.items[this.activeIndex]?.label || "";
  }
}
