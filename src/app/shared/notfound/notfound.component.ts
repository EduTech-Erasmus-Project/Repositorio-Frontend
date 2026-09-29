import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "app-notfound",
    templateUrl: "./notfound.component.html",
    styleUrls: ["./notfound.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
/**
 * Pantalla compartida para rutas inexistentes o enlaces rotos.
 *
 * Se usa como cierre del router principal cuando ninguna ruta valida coincide
 * con la URL solicitada.
 */
export class NotfoundComponent {
  readonly homeRoute = ["/"];
  readonly searchRoute = ["/search"];
}
