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
  public role_name: string='';
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
  ngOnInit(): void {

    this.loginService.characterLogin.subscribe((res) => {
      if(res == true){
        this.role_name = this.getROLE(this.loginService.user.roles[0]);
      }else if(res == false){
       this.role_name=''; 
      }
    })

    if (this.loginService.user) {
      this.role_name = this.getROLE(this.loginService.user.roles[0]);
    }    


    this.translate = this.languageService.translate;
    this.loadMenu();

   

    this.addMenuItems();
      
      this.loginService.characterMenu.subscribe((res)=>{
        if(res == true){
          this.addMenuItems();
        }else if(res == false){
          this.tieredItems = this.tieredItems.slice(0,-2);
        }
      });

    
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

  /*  if(this.roleTeacher == true){
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
    }*/
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

  private addMenuItems(){
    if(this.roleTeacher){
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

  get roleTeacher() {
    return this.loginService.validateRole("teacher");
  }
}
