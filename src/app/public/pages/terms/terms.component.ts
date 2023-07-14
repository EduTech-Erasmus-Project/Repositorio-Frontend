import { Component, OnInit } from "@angular/core";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-terms",
  templateUrl: "./terms.component.html",
  styleUrls: ["./terms.component.scss"],
})
export class TermsComponent implements OnInit {
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
      { label: await this.languageService.translate.get('menu.termsAndConditions').toPromise(), routerLink: ["/terms-and-conditions"] },
    ]);
  }

}
