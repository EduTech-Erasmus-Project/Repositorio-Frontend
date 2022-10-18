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
  public language: any;


  constructor(
    public appMain: PublicComponent,
    private languageService: LanguageService,
    public loginService: LoginService,
    private router: Router,
    private translateService: TranslateService,
    private _storageService: StorageService
  ) {
    if (
      this.loginService.user?.administrator ||
      this.loginService.validateRole("superuser")
    ) {
      this.router.navigateByUrl("/admin");
    }

    translateService.onLangChange.subscribe((translate: LangChangeEvent) => {
      this.language = translate.translations;
      this.loadMenu();
    })
  }



  ngOnInit(): void {
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
    this.addMenuItems();

    this.loginService.characterMenu.subscribe((res) => {
      if (res == true) {
        this.addMenuItems();
      } else if (res == false) {
        this.tieredItems = this.tieredItems.slice(0, -2);
      }
    });
    //Metodos para usar los servicios de traduccion 
    this.storage_get_lenguage();
    this.loadMenu();
  }

  private storage_get_lenguage() {
    if (this._storageService.getCookieItem('lenguaje') != null && this._storageService.getCookieItem('lenguaje') == 'en') {
      this.language = this.languageService.translate.translations.en;
    } else {
      this.language = this.languageService.translate.translations.es;
    }
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

  loadMenu() {
    this.countries = [
      { name: "Español", code: "ES" },
      { name: "Ingles", code: "US" },
    ];



    //this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
    this.tieredItems = [
      {
        label: this.language.menu.home,//this.translate.translations.menu.home,
        routerLink: "/",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: this.language.menu.aboutUs, //translate.translations.menu.aboutUs,
        routerLink: "about-us",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: this.language.menu.services, //translate.translations.menu.services,
        routerLink: "services",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: this.language.menu.contact, //translate.translations.menu.contact,
        routerLink: "contact",
        routerLinkActiveOptions: {
          exact: true,
          //styleClass: "active",
        },
      },
      {
        label: this.language.menu.search,
        routerLink: "/search",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: this.language.menu.developers,
        routerLink: "/developers",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
        styleClass: "homeItem",
      },
      {
        label: this.language.menu.userGuide,
        routerLink: "/guide/introduction",
        routerLinkActiveOptions: {
          exact: true,
        },
      },
    ];
  }

  private addMenuItems() {
    if (this.roleTeacher) {
      this.tieredItems.push(
        {
          label: "Mis OAs",
          routerLink: "/settings/my-objects",
          routerLinkActiveOptions: {
            exact: true,
          },
        },
        {
          label: "Subir un OA",
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
