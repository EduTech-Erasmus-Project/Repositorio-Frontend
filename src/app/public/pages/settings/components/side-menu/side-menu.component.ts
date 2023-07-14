import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "../../../../../services/login.service";

@Component({
  selector: "app-side-menu",
  templateUrl: "./side-menu.component.html",
  styleUrls: ["./side-menu.component.scss"],
})
export class SideMenuComponent implements OnInit {
  public items: MenuItem[];

  constructor(
    private loginService: LoginService,
    private languageService:LanguageService
    ) {}

  ngOnInit(): void {
   this.load_side_menu();
   
  }
  onQuit() {
    //console.log("quit")
    this.loginService.signOut();
  }

  private async load_side_menu(){
    let exit = await this.languageService.translate.get("menu.sideMenu.exit").toPromise();
    let security = await this.languageService.translate.get("menu.sideMenu.security").toPromise();
    let myAccount = await this.languageService.translate.get("menu.sideMenu.myAccount").toPromise();
    
    this.items = [
      {
        label: myAccount,
        icon: "pi pi-fw pi-user-edit",
        routerLink: "profile",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
      },
      {
        label: security,
        icon: "pi pi-fw pi-key",
        routerLink: "security",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
      },
      {
        separator: true,
      },
      {
        label: exit,
        icon: "pi pi-fw pi-power-off",
        command: (event) => {
          this.onQuit();
        },
      },
    ]; 
     //console.log("role student", this.loginService.user)
    let viewI = await this.languageService.translate.get("recommended.viewed").toPromise();
    let qualificateI = await this.languageService.translate.get("menu.sideMenu.ratedMe").toPromise();
      if (this.loginService.validateRole("student")) {
        this.items.splice(2, 0, {
          label: viewI,
          icon: "pi pi-fw pi-list",
          routerLink: "my-views",
          routerLinkActiveOptions: {
            exact: true,
            styleClass: "router-active",
          },
        });
        this.items.splice(1, 0, {
          label: qualificateI,
          icon: "pi pi-fw pi-check",
          routerLink: "objects-qualified",
          routerLinkActiveOptions: {
            exact: true,
            styleClass: "router-active",
          },
        });
      }
  
      if (this.loginService.validateRole("teacher")) {
        this.items.splice(2, 0, {
          label: await this.languageService.translate.get('menu.sideMenu.myObjectsA').toPromise(),
          icon: "pi pi-fw pi-list",
          routerLink: "my-objects",
          routerLinkActiveOptions: {
            exact: true,
            styleClass: "router-active",
          },
        });
  
        this.items.splice(3, 0, {
          label: await this.languageService.translate.get('menu.sideMenu.uploadOA').toPromise(),
          icon: "pi pi-fw pi-upload",
          routerLink: "new-object",
          routerLinkActiveOptions: {
            exact: true,
            styleClass: "router-active",
          },
        });
      }
      
      if (this.loginService.validateRole("expert")) {
          this.items.splice(1, 0, {
            label: await this.languageService.translate.get('menu.sideMenu.OAQualificate').toPromise(),
          icon: "pi pi-fw pi-check",
          routerLink: "objects-qualified",
          routerLinkActiveOptions: {
            exact: true,
            styleClass: "router-active",
          },
          })
      }

  }
}
