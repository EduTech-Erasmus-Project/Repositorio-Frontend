import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

/**
 * Publica la informacion institucional del proyecto y sus herramientas asociadas.
 *
 * Responsabilidades:
 * - Renderizar la narrativa base de "nosotros".
 * - Exponer accesos a proyectos satelite relacionados.
 * - Publicar el breadcrumb publico de la ruta.
 */
@Component({
    selector: 'app-aboutus',
    templateUrl: './aboutus.component.html',
    styleUrls: ['./aboutus.component.scss'],
    standalone: false
})
export class AboutusComponent implements OnInit {
  constructor(
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
  }

  /**
   * Resuelve el label traducido del breadcrumb antes de publicarlo en el shell.
   */
  private async addBreadcrumb(): Promise<void> {
    this.breadcrumbService.setItems([
      { label: 'ROA' },
      {
        label: await firstValueFrom(this.languageService.translate.get('menu.aboutUs')),
        routerLink: ['/about-us']
      }
    ]);
  }
}
