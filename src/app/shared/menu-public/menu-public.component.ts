import { Component, OnInit } from "@angular/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { LanguageService } from "../../services/language.service";
import { LoginService } from "../../services/login.service";
import { PublicComponent } from "../../public/public.component";
import { Router, NavigationExtras } from "@angular/router";
import { StorageService } from "src/app/services/storage.service";

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
  public role_name: string = '';



  constructor(
    public appMain: PublicComponent,
    private languageService: LanguageService,
    public loginService: LoginService,
    private router: Router,
  ) {
    if (
      this.loginService.user?.administrator ||
      this.loginService.validateRole("superuser")
    ) {
      this.router.navigateByUrl("/admin");
    }
  }



  ngOnInit(): void {
    this.loadMenu();
    this.loginService.characterLogin.subscribe((res) => {
      if (res == true) {
        this.role_name = this.getROLE(this.loginService.user.roles[0]);
      } else if (res == false) {
        this.role_name = '';
      }
    })
    if (this.loginService.user) {
      this.role_name = this.getROLE(this.loginService.user.roles[0]);
    }

    this.loginService.characterMenu.subscribe((res) => {
      if (res == true) {
        this.addMenuItems();
      } else if (res == false) {
        this.tieredItems = this.tieredItems.slice(0, -2);
      }
    });
  }

  getROLE(role: string) {
    switch (role) {
      case 'teacher':
        return 'Prof.'
      case "expert":
        return 'Exp.'
      case "student":
        return 'Est.'
    }
  }

  async loadMenu() {
    this.countries = [
      { name: "Español", code: "ES" },
      { name: "Ingles", code: "US" },
    ];

    //this.language.menu.home

    //this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
    this.tieredItems = [
      {
        label: await this.languageService.translate.get("menu.home").toPromise() || "",//this.translate.translations.menu.home,
        routerLink: "/",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: await this.languageService.translate.get("menu.aboutUs").toPromise() || "", //translate.translations.menu.aboutUs,
        routerLink: "about-us",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      // {
      //   label: await this.languageService.translate.get("menu.services").toPromise() || "", //translate.translations.menu.services,
      //   routerLink: "services",
      //   routerLinkActiveOptions: {
      //     exact: true,
      //   },
      // },
      {
        label: await this.languageService.translate.get("menu.contact").toPromise() || "", //translate.translations.menu.contact,
        routerLink: "contact",
        routerLinkActiveOptions: {
          exact: true,
          //styleClass: "active",
        },
      },
      {
        label: await this.languageService.translate.get("menu.search").toPromise() || "",
        routerLink: "search",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      // {
      //   label: await this.languageService.translate.get("menu.developers").toPromise() || "",
      //   routerLink: "developers",
      //   routerLinkActiveOptions: {
      //     exact: true,
      //     styleClass: "router-active",
      //   },
      //   styleClass: "homeItem",
      // },
      {
        label: await this.languageService.translate.get("menu.userGuide").toPromise() || "",
        routerLink: "guide/eXeLearning",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
    ];

    this.addMenuItems();
  }

  private async addMenuItems() {
    if (this.roleTeacher) {
      this.tieredItems.push(
        {
          label: await this.languageService.translate.get("menu.myOAs").toPromise(),
          routerLink: "/settings/my-objects",
          routerLinkActiveOptions: {
            exact: true,
          },
        },
        {
          label: await this.languageService.translate.get("menu.uploadOAs").toPromise(),
          routerLink: "/settings/new-object",
          routerLinkActiveOptions: {
            exact: true,
          },
        },
      )
    }
  }
  mobileMegaMenuItemClick(index) {
    this.appMain.megaMenuMobileClick = true;
    this.activeItem = this.activeItem === index ? null : index;
  }

  logOut() {
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

  get roleTeacher() {
    return this.loginService.validateRole("teacher");
  }
}
