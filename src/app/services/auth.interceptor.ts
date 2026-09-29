import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { EMPTY, Observable, throwError } from "rxjs";
import { LoginService } from "./login.service";
import { catchError, switchMap } from "rxjs/operators";
import { SessionRefreshService } from "./session-refresh.service";
import {
  isBackendApiRequest,
  isCookieSessionEndpoint,
  isMutableBackendRequest,
  readCookieValue,
} from "../core/utils/auth-cookie.utils";

@Injectable()
/**
 * Interceptor global de autenticacion.
 *
 * Agrega los headers base de sesion por cookie y delega la renovacion del
 * access token a una cola compartida de refresh.
 */
export class AuthInterceptor implements HttpInterceptor {
  private static readonly REFRESHABLE_AUTH_DETAILS = new Set([
    "Authentication credentials were not provided.",
    "Invalid Token",
    "The Token is expired",
  ]);

  constructor(
    private sessionRefreshService: SessionRefreshService,
    private loginService: LoginService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    request = this.addAuthorizationHeader(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this.shouldRefreshSession(error, request)) {
          return this.errorUnauthorized(request, next);
        } else if (error?.error?.code === "token_not_valid") {
          this.loginService.signOut();
          return EMPTY;
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  /**
   * Clona la request agregando los headers base usados por el frontend.
   */
  addAuthorizationHeader(request: HttpRequest<unknown>): HttpRequest<unknown> {
    const csrfToken = readCookieValue("csrftoken");
    const setHeaders: Record<string, string> = {
      Accept: "application/json",
    };

    if (csrfToken && isMutableBackendRequest(request.method, request.url)) {
      setHeaders["X-CSRFToken"] = csrfToken;
    }

    return request.clone({
      withCredentials:
        request.withCredentials || isBackendApiRequest(request.url),
      setHeaders,
    });
  }

  /**
   * Reintenta la request original despues de refrescar el access token.
   */
  errorUnauthorized(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.sessionRefreshService.refreshOnce().pipe(
      switchMap(() => next.handle(this.addAuthorizationHeader(request))),
      catchError(() => {
        this.loginService.signOut();
        return EMPTY;
      })
    );
  }

  /**
   * Determina si un `401` del backend principal amerita intentar refresh y
   * reintentar la request original.
   */
  private shouldRefreshSession(
    error: HttpErrorResponse,
    request: HttpRequest<unknown>
  ): boolean {
    if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
      return false;
    }

    if (!isBackendApiRequest(request.url) || isCookieSessionEndpoint(request.url)) {
      return false;
    }

    const tokenType = error.error?.messages?.[0]?.token_type;
    const code = error.error?.code;
    const detail = error.error?.detail;

    return (
      tokenType === "access" ||
      code === "token_not_valid" ||
      AuthInterceptor.REFRESHABLE_AUTH_DETAILS.has(detail) ||
      error.statusText === "Unknown Error"
    );
  }
}
