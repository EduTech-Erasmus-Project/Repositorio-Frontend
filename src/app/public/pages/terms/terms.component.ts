import { Component, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

/**
 * Publica los terminos y condiciones del repositorio para navegacion anonima o autenticada.
 *
 * Responsabilidades:
 * - Renderizar el contenido legal e informativo de uso.
 * - Mantener el breadcrumb publico de la ruta.
 */
@Component({
    selector: "app-terms",
    templateUrl: "./terms.component.html",
    styleUrls: ["./terms.component.scss"],
    standalone: false
})
export class TermsComponent implements OnInit {
  constructor(
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
  }

  /**
   * Resuelve el label traducido de terminos antes de publicarlo en el breadcrumb.
   */
  private async addBreadcrumb(): Promise<void> {
    this.breadcrumbService.setItems([
      {label: "ROA"},
      {
        label: await firstValueFrom(
          this.languageService.translate.get("menu.termsAndConditions")
        ),
        routerLink: ["/terms-and-conditions"],
      },
    ]);
  }
}
