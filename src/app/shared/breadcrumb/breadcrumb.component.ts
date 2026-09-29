import { ChangeDetectorRef, Component, DestroyRef, ElementRef, Input, OnInit, ViewChild, inject } from "@angular/core";
import { BreadcrumbService } from "../../services/breadcrumb.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MenuItem } from "primeng/api";

@Component({
    selector: "app-breadcrumb",
    templateUrl: "./breadcrumb.component.html",
    styleUrls: ["./breadcrumb.component.scss"],
    standalone: false
})
/**
 * Breadcrumb compartido del shell administrativo.
 *
 * Consume la traza publicada por `BreadcrumbService` y aplica ajustes de accesibilidad
 * para que la miga funcione como referencia visual, no como una parada adicional de tab.
 */
export class BreadcrumbComponent implements OnInit {
  @Input() interactive = false;

  items: MenuItem[] = [];
  @ViewChild("breadcrumbHost") breadcrumbHost?: ElementRef<HTMLElement>;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    public breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Escucha la traza administrativa compartida y refresca el DOM antes de ajustar el tab order.
   */
  ngOnInit(): void {
    this.breadcrumbService.items$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.items = response || [];
        this.refreshView();
        requestAnimationFrame(() => this.syncBreadcrumbInteractivity());
      });
  }

  /**
   * Fuerza el refresco del breadcrumb cuando la traza cambia fuera del mismo ciclo de chequeo.
   */
  private refreshView(): void {
    this.cdr.detectChanges();
  }

  /**
   * Mantiene los breadcrumbs publicos como referencia visual y permite navegacion real en admin.
   */
  private syncBreadcrumbInteractivity(): void {
    if (this.interactive) {
      return;
    }

    const host = this.breadcrumbHost?.nativeElement;

    if (!host) {
      return;
    }

    host
      .querySelectorAll<HTMLElement>(
        ".p-breadcrumb .p-menuitem-link, .p-breadcrumb a, .p-breadcrumb button"
      )
      .forEach((element) => {
        element.setAttribute("tabindex", "-1");
      });
  }
}
