import { Component, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

/**
 * Pantalla de confirmacion final del cambio de contrasena.
 *
 * Responsabilidades:
 * - mostrar el mensaje final del flujo de reset exitoso
 * - ofrecer el retorno directo al login
 * - publicar el breadcrumb de confirmacion
 */
@Component({
  selector: "app-reset",
  templateUrl: "./reset.component.html",
  styleUrls: ["./reset.component.scss"],
  standalone: false
})
export class ResetComponent implements OnInit {
  constructor(
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
  }

  /**
   * Publica el breadcrumb traducido de confirmacion del reset.
   */
  private async addBreadcrumb() {
    const breadcrumbLabel = await firstValueFrom(
      this.languageService.translate.get("menu.confirmResetPassword")
    );

    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: breadcrumbLabel, routerLink: ["/login"] },
    ]);
  }
}
