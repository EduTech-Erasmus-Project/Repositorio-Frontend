import { Component, OnInit } from "@angular/core";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-developers",
  templateUrl: "./developers.component.html",
  styleUrls: ["./developers.component.scss"],
})
export class DevelopersComponent implements OnInit {
  constructor(
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {
    this.add_breadcrumb();
  }

  ngOnInit(): void {}

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      {label: "ROA"},
      { label: await this.languageService.translate.get('menu.developers').toPromise(), routerLink: ["/developers"] },
    ]);
  }
}
