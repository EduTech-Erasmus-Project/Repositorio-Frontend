import { Component, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { DEVELOPERS_DATA } from "../../data/developers.data";
import { DeveloperProfile } from "../../data/developer-profile";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

/**
 * Presenta la pagina publica del equipo de desarrollo del repositorio.
 *
 * Responsabilidades:
 * - Renderizar el catalogo compartido del equipo.
 * - Mantener una ruta publica estable para esta informacion.
 * - Publicar el breadcrumb correspondiente.
 */
@Component({
  selector: "app-developers",
  templateUrl: "./developers.component.html",
  styleUrls: ["./developers.component.scss"],
  standalone: false,
})
export class DevelopersComponent implements OnInit {
  public readonly developers: DeveloperProfile[] = DEVELOPERS_DATA;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
  }

  /**
   * Publica el breadcrumb traducido de la pagina de desarrolladores.
   */
  private async addBreadcrumb(): Promise<void> {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: await firstValueFrom(this.languageService.translate.get("menu.developers")),
        routerLink: ["/developers"],
      },
    ]);
  }
}
