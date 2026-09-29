import { Component, OnInit } from "@angular/core";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { firstValueFrom } from "rxjs";

/**
 * Presenta el mensaje intermedio que indica al usuario que debe revisar
 * su correo para continuar con la activacion de cuenta.
 */

@Component({
  selector: "app-email-message",
  templateUrl: "./email-message.component.html",
  styleUrls: ["./email-message.component.scss"],
  standalone: false,
})
export class EmailMessageComponent implements OnInit {
  constructor(
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
  }

  /**
   * Publica el breadcrumb del mensaje intermedio enviado tras solicitar
   * verificacion por correo.
   */
  private async addBreadcrumb(): Promise<void> {
    const sendLinkLabel = await firstValueFrom(
      this.languageService.translate.get("menu.sendLink")
    );

    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: sendLinkLabel, routerLink: ["/emailMessage"] },
    ]);
  }
}
