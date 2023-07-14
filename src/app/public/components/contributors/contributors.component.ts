import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-contributors",
  templateUrl: "./contributors.component.html",
  styleUrls: ["./contributors.component.scss"],
})
export class ContributorsComponent implements OnInit {
  public contributors = [
    {
      name: "Universidad de Alcalá",
      img: "assets/img/logos/UDA.png",
      alt: "Universidad de Alcalá",
      web: "https://www.uah.es/es/",
    },
    {
      name: "Universidad Politécnica Salesiana",
      img: "assets/img/logos/UPS.png",
      alt: "Universidad Politécnica Salesiana",
      web: "https://www.ups.edu.ec/",
    },
    {
      name: "Universidad de Alicante",
      img: "assets/img/logos/UDAli.png",
      alt: "Universidad de Alicante",
      web: "https://www.ua.es/",
    },
    {
      name: "Universidad de AbERTA",
      img: "assets/img/logos/UNIV.png",
      alt: "Universidad de AbERTA",
      web: "https://portal.uab.pt/en/",
    },
    {
      name: "Universidad de Ostfold",
      img: "assets/img/logos/hiof.png",
      alt: "Universidad de Ostfold",
      web: "https://www.hiof.no/",
    },
    {
      name: "Universidad del Azuay",
      img: "assets/img/logos/UDAzu.png",
      alt: "Universidad del Azuay",
      web: "https://www.uazuay.edu.ec/",
    },
    {
      name: "Universidad Veracruzana",
      img: "assets/img/logos/UV.png",
      alt: "Universidad Veracruzana",
      web: "https://www.uv.mx/",
    },
    {
      name: "Instituto Tecnológico de Aguascalientes",
      img: "assets/img/logos/UTDA.png",
      alt: "Instituto Tecnológico de Aguascalientes",
      web: "https://aguascalientes.tecnm.mx/",
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
