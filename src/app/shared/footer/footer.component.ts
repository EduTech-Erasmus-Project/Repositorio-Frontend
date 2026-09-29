import { Component } from "@angular/core";

@Component({
    selector: "app-footer",
    templateUrl: "./footer.component.html",
    styleUrls: ["./footer.component.scss"],
    standalone: false
})
/**
 * Footer compartido del proyecto.
 *
 * Se monta tanto en el shell publico como en el administrativo, por eso expone
 * rutas absolutas y contenido institucional reutilizable.
 */
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly termsRoute = ["/terms-and-conditions"];
}
