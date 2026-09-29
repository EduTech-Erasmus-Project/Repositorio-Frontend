import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { MenuItem } from "primeng/api";
import { NavigationEnd, Router, ActivatedRoute } from "@angular/router";
import { filter } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "app-breadcrumb-public",
    templateUrl: "./breadcrumb-public.component.html",
    styleUrls: ["./breadcrumb-public.component.scss"],
    standalone: false
})
/**
 * Genera el breadcrumb publico a partir del arbol activo del router usando
 * la metadata `breadcrumb` declarada en las rutas.
 */
export class BreadcrumbPublicComponent implements OnInit {
  static readonly ROUTE_DATA_BREADCRUMB = "breadcrumb";
  public menuItems: MenuItem[] = [];
  private readonly destroyRef = inject(DestroyRef);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.updateBreadcrumbs();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updateBreadcrumbs());
  }

  /**
   * Recalcula el breadcrumb publico usando el arbol activo del router.
   */
  private updateBreadcrumbs(): void {
    this.menuItems = this.createBreadcrumbs(this.activatedRoute.root);
  }

  /**
   * Recorre la rama activa del router y construye la ruta navegable visible
   * para el breadcrumb publico.
   */
  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = "#",
    breadcrumbs: MenuItem[] = []
  ): MenuItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join("/");
      if (routeURL !== "") {
        url += `/${routeURL}`;
      }

      const label =
        child.snapshot.data[BreadcrumbPublicComponent.ROUTE_DATA_BREADCRUMB];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
  }
}
