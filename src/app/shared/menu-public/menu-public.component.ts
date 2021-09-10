import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LanguageService } from "../../services/language.service";
import { LoginService } from "../../services/login.service";
import { PublicComponent } from "../../public/public.component";
import { Router, NavigationExtras } from "@angular/router";

@Component({
  selector: "app-menu-public",
  templateUrl: "./menu-public.component.html",
  styleUrls: ["./menu-public.component.scss"],
})
export class MenuPublicComponent implements OnInit {
  public translate: TranslateService;
  public tieredItems: any;
  public activeItem: number;
  public selectedCountry: string;
  public countries: any[];
  public loged: boolean;
  //private queryParams: QuerySearch = {};

  constructor(
    public appMain: PublicComponent,
    private languageService: LanguageService,
    public loginService: LoginService,
    private router: Router
  ) {
    if (
      this.loginService.user?.administrator ||
      this.loginService.validateRole("superuser")
    ) {
      this.router.navigateByUrl("/admin");
    }
  }

  ngOnInit(): void {
    this.translate = this.languageService.translate;
    this.loadMenu();

    // this.loginService
    //   .isLoged()
    //   .then((res: boolean) => {
    //     //console.log("menu res", res);
    //     this.loged = res;
    //   })
    //   .catch((err: boolean) => {
    //     //console.log("menu err", err);
    //     this.loged = err;
    //   });

    //this.loged = false
  }

  loadMenu() {
    this.countries = [
      { name: "Español", code: "ES" },
      { name: "Ingles", code: "US" },
    ];

    //this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
    this.tieredItems = [
      {
        label: "Inicio", //translate.translations.menu.home,
        routerLink: "/",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: "Nosotros", //translate.translations.menu.aboutUs,
        routerLink: "about-us",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: "Servicios", //translate.translations.menu.services,
        routerLink: "services",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: "Contacto", //translate.translations.menu.contact,
        routerLink: "contact",
        routerLinkActiveOptions: {
          exact: true,
          //styleClass: "active",
        },
      },
      {
        label: "Buscar",
        routerLink: "/search",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: "Desarrolladores",
        routerLink: "/developers",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
        styleClass: "homeItem",
      },
    ];
    //});
    // console.log("user menu");
    // if (this.loginService.validateRole("student")) {
    //   this.tieredItems.push({
    //     label: "Recomendados",
    //     routerLink: "recommended",
    //     routerLinkActiveOptions: {
    //       exact: true,
    //       styleClass: "",
    //     },
    //   });
    // }
  }

  mobileMegaMenuItemClick(index) {
    this.appMain.megaMenuMobileClick = true;
    this.activeItem = this.activeItem === index ? null : index;
  }

  logOut() {
    //console.log("saliendo")
    this.loginService.signOut();
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  navigateExpert(route: string) {
    let extras: NavigationExtras = {
      queryParams: {
        is_evaluated: "False",
      },
    };
    this.router.navigate([route], extras);
  }

  navigateStudent() {
    this.router.navigate(["recommended"]);
  }
}
