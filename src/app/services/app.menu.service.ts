import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
/**
 * Canal de eventos liviano para coordinar el estado del menu administrativo.
 *
 * Se usa como bus local entre componentes del shell para abrir ramas activas
 * o forzar un reset del arbol cuando cambia el contexto de navegacion.
 */
export class MenuService {

    private readonly menuSource = new Subject<string>();
    private readonly resetSource = new Subject<void>();

    readonly menuState$ = this.menuSource.asObservable();
    readonly reset$ = this.resetSource.asObservable();

    /**
     * Emite la clave de menu que debe marcarse como activa.
     */
    onMenuStateChange(key: string): void {
        this.menuSource.next(key);
    }

    /**
     * Solicita a los consumidores limpiar el estado expandido del menu.
     */
    reset(): void {
        this.resetSource.next();
    }
}
