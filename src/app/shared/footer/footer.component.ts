import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit {
  public countries: any[];
  public selectedCountry: string;
  public currentYear: number;

  constructor() {}

  ngOnInit(): void {
    this.countries = [
      { name: "Español", code: "es" },
      { name: "Ingles", code: "en" },
    ];
    this.currentYear = new Date().getFullYear();
  }
}
