import { Injectable } from "@angular/core";
import { EMPTY, Observable, Subscription } from "rxjs";
import { catchError, finalize, shareReplay } from "rxjs/operators";
import { AuthTokenResponse } from "../core/interfaces/api-contracts";
import { TokenService } from "./token.service";

const DEFAULT_PREVENTIVE_REFRESH_INTERVAL_MS = 4 * 60 * 1000;

@Injectable({
  providedIn: "root",
})
/**
 * Centraliza la renovacion de sesion por cookie para evitar carreras cuando
 * varias capas intentan refrescar el access token al mismo tiempo.
 */
export class SessionRefreshService {
  private refreshRequest$: Observable<AuthTokenResponse> | null = null;
  private preventiveRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private preventiveRefreshSubscription: Subscription | null = null;
  private lastSuccessfulRefreshAt: number | null = null;

  constructor(private readonly tokenService: TokenService) {}

  /**
   * Ejecuta un unico refresh concurrente y comparte el resultado entre todos
   * los consumidores activos.
   */
  refreshOnce(): Observable<AuthTokenResponse> {
    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.tokenService.refreshToken().pipe(
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.refreshRequest$;
  }

  /**
   * Inicia una renovacion preventiva periodica. No cierra sesion si falla:
   * el flujo reactivo por `401` conserva la decision final de logout.
   */
  startPreventiveRefresh(
    intervalMs: number = DEFAULT_PREVENTIVE_REFRESH_INTERVAL_MS
  ): void {
    if (this.preventiveRefreshTimer) {
      return;
    }

    this.preventiveRefreshTimer = setInterval(() => {
      this.runPreventiveRefresh();
    }, intervalMs);
  }

  /**
   * Detiene la renovacion preventiva y cancela cualquier suscripcion activa
   * iniciada por el timer.
   */
  stopPreventiveRefresh(): void {
    if (this.preventiveRefreshTimer) {
      clearInterval(this.preventiveRefreshTimer);
      this.preventiveRefreshTimer = null;
    }

    this.preventiveRefreshSubscription?.unsubscribe();
    this.preventiveRefreshSubscription = null;
    this.lastSuccessfulRefreshAt = null;
  }

  getLastSuccessfulRefreshAt(): number | null {
    return this.lastSuccessfulRefreshAt;
  }

  private runPreventiveRefresh(): void {
    this.preventiveRefreshSubscription?.unsubscribe();

    this.preventiveRefreshSubscription = this.refreshOnce()
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        finalize(() => {
          this.preventiveRefreshSubscription = null;
        })
      )
      .subscribe(() => {
        this.lastSuccessfulRefreshAt = Date.now();
      });
  }
}
