import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "app-accessdenied",
    templateUrl: "./accessdenied.component.html",
    styleUrls: ["./accessdenied.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
/**
 * Pantalla compartida para accesos bloqueados dentro del proyecto.
 *
 * Su responsabilidad es ofrecer una salida clara cuando el usuario entra a una
 * ruta o accion para la que no tiene permisos suficientes.
 */
export class AccessdeniedComponent {
  readonly homeRoute = ["/"];
}
