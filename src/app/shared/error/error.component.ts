import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "app-error",
    templateUrl: "./error.component.html",
    styleUrls: ["./error.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
/**
 * Pantalla compartida para fallos no recuperables del frontend.
 *
 * Su responsabilidad es ofrecer una salida segura cuando una ruta o flujo
 * termina en un estado de error general.
 */
export class ErrorComponent {
  constructor(private readonly location: Location) {}

  /**
   * Devuelve al usuario a la pantalla previa del historial del navegador.
   */
  goBack(): void {
    this.location.back();
  }
}
