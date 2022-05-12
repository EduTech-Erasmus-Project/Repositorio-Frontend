import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";
import { LoginService } from "../../../../../services/login.service";

@Component({
  selector: "app-side-menu",
  templateUrl: "./side-menu.component.html",
  styleUrls: ["./side-menu.component.scss"],
})
export class SideMenuComponent implements OnInit {
  public items: MenuItem[];

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.items = [
      {
        label: "Mi perfil",
        icon: "pi pi-fw pi-user-edit",
        routerLink: "profile",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
      },
      {
        label: "Seguridad",
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
        label: "Salir",
        icon: "pi pi-fw pi-power-off",
        command: (event) => {
          this.onQuit();
        },
      },
    ];

    //console.log("role student", this.loginService.user)

    if (this.loginService.validateRole("student")) {
      this.items.splice(3, 0, {
        label: "Vistos por mi",
        icon: "pi pi-fw pi-list",
        routerLink: "my-views",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
      });
      this.items.splice(2, 0, {
        label: "Calificados por mi",
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
        label: "Mis Objetos de aprendizaje",
        icon: "pi pi-fw pi-list",
        routerLink: "my-objects",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
      });

      this.items.splice(3, 0, {
        label: "Subir Objeto de aprendizaje",
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
          label: "Objetos de aprendizaje calificados",
        icon: "pi pi-fw pi-check",
        routerLink: "objects-qualified",
        routerLinkActiveOptions: {
          exact: true,
          styleClass: "router-active",
        },
        })
    }
  }
  onQuit() {
    //console.log("quit")
    this.loginService.signOut();
  }
}
