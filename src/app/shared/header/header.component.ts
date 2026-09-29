import { Component, Input } from '@angular/core';

/**
 * Renderiza un encabezado visual reutilizable para secciones que necesitan
 * titulo configurable, alto variable y tamano de texto ajustable.
 */
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent {
  @Input() header_title = "";
  @Input() header_height = 17;
  @Input() header_text_size = 18;
}
