import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from 'primeng/api';

@Injectable()
/**
 * Fuente compartida para el breadcrumb administrativo.
 *
 * Mantiene la ultima secuencia de `MenuItem` calculada por la vista activa y
 * permite que el shell la pinte sin acoplarse a un componente especifico.
 */
export class BreadcrumbService {
    private readonly itemsSource = new BehaviorSubject<MenuItem[]>([]);
    readonly items$ = this.itemsSource.asObservable();

    /**
     * Reemplaza la ruta visible del breadcrumb con el estado actual.
     */
    setItems(items: MenuItem[]): void {
        this.itemsSource.next(items);
    }
}
