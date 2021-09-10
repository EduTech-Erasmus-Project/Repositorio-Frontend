import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";
import { NavigationEnd, Router, ActivatedRoute } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-breadcrumb-public",
  templateUrl: "./breadcrumb-public.component.html",
  styleUrls: ["./breadcrumb-public.component.scss"],
})
export class BreadcrumbPublicComponent implements OnInit {
  static readonly ROUTE_DATA_BREADCRUMB = "breadcrumb";
  //readonly home = {child:"inicio", icon: "pi pi-home", url: "/#/" };
  public menuItems: MenuItem[];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.menuItems = this.createBreadcrumbs(this.activatedRoute.root);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(
        () =>
          (this.menuItems = this.createBreadcrumbs(this.activatedRoute.root))
      );
  }

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
