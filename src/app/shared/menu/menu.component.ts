import { Component, OnInit } from "@angular/core";
import { AdminComponent } from "src/app/admin/admin.component";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
})
export class MenuComponent implements OnInit {
  model: any[];
  activeMenu: boolean = false;
  constructor(
    public appMain: AdminComponent,
    public loginService: LoginService
  ) {}

  ngOnInit() {
    this.loginService.user.roles.includes("superuser")
      ? (this.model = [
          { label: "Inicio", icon: "pi pi-fw pi-home", routerLink: ["/admin"] },
          {
            label: "Objeto de aprendizaje",
            icon: "pi pi-fw pi-book",
            routerLink: ["/admin/learning-object"],
            items: [
              {
                label: "OA Pendientes",
                routerLink: ["/admin/learning-object/pending"],
              },
              {
                label: "OA Aprobados",
                routerLink: ["/admin/learning-object/approved"],
              },
            ],
          },
          {
            label: "Docente & Experto",
            icon: "pi pi-fw pi-user",
            routerLink: ["/admin/teacher"],
            items: [
              {
                label: "Solicitudes pendientes",
                routerLink: ["./teacher/request/pending"],
              },
              {
                label: "Solicitudes aprobados",
                routerLink: ["./teacher/request/approved"],
              },
            ],
          },
          {
            label: "Estudiante",
            icon: "pi pi-fw pi-user",
            routerLink: ["/admin/student"],
            items: [
              {
                label: "Estudiantes",
                icon: "pi pi-fw pi-list",
                routerLink: ["./student"],
              },
            ],
          },
          {
            label: "Usuario administrador",
            icon: "pi pi-fw pi-user",
            routerLink: ["/admin/administrator"],
            items: [
              {
                label: "Registrar",
                icon: "pi pi-fw pi-id-card",
                routerLink: ["/admin/administrator/register"],
              },
              {
                label: "Listar",
                icon: "pi pi-fw pi-list",
                routerLink: ["/admin/administrator/list"],
              },
            ],
          },
          /////////////////////////Añadi en el menu 
          {
            label: "Evaluación",
            icon: "pi pi-fw pi-check-square",
            routerLink: ["/admin/expert/question"],
            items: [
              {
                label: "Experto",
                icon: "pi pi-fw pi-pencil",
                routerLink: ["/admin/expert/question"],
              },
              {
                label: "Automatico",
                icon: "pi pi-fw pi-pencil",
                routerLink: ["/admin/expert/automatic"],
              },
              {
                label: "Estudiante",
                icon: "pi pi-fw pi-pencil",
                routerLink: ["/admin/expert/student"],
              },
            ],
          },
        ])
      : (this.model = [
          { label: "Inicio", icon: "pi pi-fw pi-home", routerLink: ["/admin"] },
          {
            label: "Objeto de aprendizaje",
            icon: "pi pi-fw pi-book",
            routerLink: ["/admin/learning-object"],
            items: [
              {
                label: "OA Pendientes",
                routerLink: ["/admin/learning-object/pending"],
              },
              {
                label: "OA Aprovados",
                routerLink: ["/admin/learning-object/approved"],
              },
            ],
          },
          {
            label: "Docente & Experto",
            icon: "pi pi-fw pi-user",
            routerLink: ["/admin/teacher"],
            items: [
              {
                label: "Solicitudes pendientes",
                routerLink: ["./teacher/request/pending"],
              },
              {
                label: "Solicitudes aprobados",
                routerLink: ["./teacher/request/approved"],
              },
            ],
          },
          {
            label: "Estudiante",
            icon: "pi pi-fw pi-user",
            routerLink: ["/admin/student"],
            items: [
              {
                label: "Estudiantes",
                icon: "pi pi-fw pi-list",
                routerLink: ["./student"],
              },
            ],
          },
        ]);
  }

  onMenuClick() {
    this.appMain.menuClick = true;
  }
}
