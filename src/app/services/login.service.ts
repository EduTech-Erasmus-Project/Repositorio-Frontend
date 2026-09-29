import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { NavigationExtras, Router } from "@angular/router";
import { BehaviorSubject, Observable, firstValueFrom, of } from "rxjs";
import { environment } from "../../environments/environment";
import { CurrentUser } from "../core/interfaces/CurrentUser";
import { ApiMessageResponse, AuthTokenResponse } from "../core/interfaces/api-contracts";
import { StorageService } from "./storage.service";
import { SessionRefreshService } from "./session-refresh.service";
import { catchError, finalize } from "rxjs/operators";

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root",
})
/**
 * Servicio de sesion para el frontend publico.
 *
 * Proposito:
 * - Coordinar el ciclo de autenticacion del usuario final.
 *
 * Responsabilidades:
 * - Iniciar y cerrar sesion.
 * - Cargar el usuario autenticado despues del login.
 * - Exponer estados derivados para menu y shell.
 * - Redirigir segun el rol resuelto por backend.
 *
 * No responsabilidades:
 * - Persistir tokens manualmente fuera de `StorageService`.
 * - Resolver permisos administrativos detallados.
 */
export class LoginService {
  private static readonly SESSION_RECOVERY_HINT_KEY = "roa_session_recovery_hint";

  private currUser: CurrentUser | null = null;
  private sessionHydrationPromise: Promise<boolean> | null = null;
  private isClosingSession = false;
  private readonly characterMenuSubject = new BehaviorSubject<boolean>(false);
  private readonly characterLoginSubject = new BehaviorSubject<boolean>(false);

  readonly characterMenu$ = this.characterMenuSubject.asObservable();
  readonly characterLogin$ = this.characterLoginSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly sessionRefreshService: SessionRefreshService
  ) {
    this.syncSessionState();
  }

  set currentUser(currUser: CurrentUser) {
    this.currUser = currUser;
    this.setSessionRecoveryHint(true);
    this.sessionRefreshService.startPreventiveRefresh();
    this.syncSessionState();
  }

  get user(): CurrentUser | null {
    return this.currUser;
  }

  /**
   * Solicita al backend el par de tokens para autenticar al usuario.
   */
  signIn(formData: { email: string; password: string }): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${baseUrl}/login/`, formData, {
      withCredentials: true,
    });
  }

  /**
   * Cierra la sesion actual y devuelve al inicio publico.
   */
  signOut(): void {
    this.closeServerSession("/");
  }

  /**
   * Recupera el usuario autenticado y redirige al modulo inicial segun su rol.
   */
  async validateUser(token?: string): Promise<boolean> {
    void token;
    return this.ensureAuthenticatedUser({ navigateAfterHydration: true });
  }

  /**
   * Verifica si la sesion almacenada sigue siendo valida para reutilizarla.
   */
  async isLoged(): Promise<boolean> {
    const isAuthenticated = await this.ensureAuthenticatedUser();
    return isAuthenticated ? true : Promise.reject(false);
  }

  validateRole(role: string): boolean {
    return !!this.currUser?.roles?.includes(role);
  }

  /**
   * Intenta rehidratar la sesion sin redirecciones para reconstruir menu y shell
   * despues de una recarga completa del navegador.
   */
  async bootstrapSession(): Promise<boolean> {
    if (!this.hasSessionRecoveryHint()) {
      return false;
    }

    return this.ensureAuthenticatedUser();
  }

  /**
   * Fuerza reautenticacion despues de un cambio de contrasena.
   */
  signOutPass(): void {
    this.closeServerSession("/login");
  }

  setCharacterMenuState(isVisible: boolean): void {
    this.characterMenuSubject.next(isVisible);
  }

  setCharacterLoginState(isLoggedIn: boolean): void {
    this.characterLoginSubject.next(isLoggedIn);
  }

  resetPass(data: string): Observable<ApiMessageResponse> {
    const formData = new FormData();
    formData.append("email", data);
    return this.http.post<ApiMessageResponse>(`${baseUrl}/request-reset-email/`, formData);
  }

  changePassword(data: FormData, id: number): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${baseUrl}/user/change_password/${id}/`, data);
  }

  resetPassToken(data: FormData): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${baseUrl}/password-reset-complete/`, data);
  }

  /**
   * Inicializa la cookie CSRF del flujo nuevo de autenticacion por cookies.
   */
  initializeCsrfSession(): Observable<{ message: string; cookie: string } | null> {
    return this.http
      .get<{ message: string; cookie: string }>(`${baseUrl}/csrf/`, {
        withCredentials: true,
      })
      .pipe(catchError(() => of(null)));
  }

  private syncSessionState(): void {
    this.setCharacterLoginState(!!this.currUser);
    this.setCharacterMenuState(this.hasTeacherOrExpertMenu(this.currUser));
  }

  private clearPersistedSession(): void {
    this.storageService.removeLocalItem("data_ref");
    this.storageService.removeLocalItem("data_acc");
    this.setSessionRecoveryHint(false);
  }

  private async ensureAuthenticatedUser(options?: {
    navigateAfterHydration?: boolean;
  }): Promise<boolean> {
    if (this.currUser) {
      if (options?.navigateAfterHydration) {
        this.navigateAfterLogin();
      }
      return true;
    }

    if (this.sessionHydrationPromise) {
      return this.sessionHydrationPromise;
    }

    this.sessionHydrationPromise = this.resolveAuthenticatedUser(
      !!options?.navigateAfterHydration
    ).finally(() => {
      this.sessionHydrationPromise = null;
    });

    return this.sessionHydrationPromise;
  }

  /**
   * Usa `/user/` como fuente de verdad y, si hace falta, intenta renovar la
   * sesion exclusivamente por cookie antes de darla por perdida.
   */
  private async resolveAuthenticatedUser(
    navigateAfterHydration: boolean
  ): Promise<boolean> {
    try {
      const currentUser = await this.fetchAuthenticatedUser();

      if (currentUser) {
        this.currentUser = currentUser;

        if (navigateAfterHydration) {
          this.navigateAfterLogin();
        }

        return true;
      }

      await firstValueFrom(this.sessionRefreshService.refreshOnce());

      const refreshedUser = await this.fetchAuthenticatedUser();
      if (!refreshedUser) {
        this.setSessionRecoveryHint(false);
        this.sessionRefreshService.stopPreventiveRefresh();
        this.currUser = null;
        this.syncSessionState();
        return false;
      }

      this.currentUser = refreshedUser;

      if (navigateAfterHydration) {
        this.navigateAfterLogin();
      }

      return true;
    } catch {
      this.setSessionRecoveryHint(false);
      this.sessionRefreshService.stopPreventiveRefresh();
      this.currUser = null;
      this.syncSessionState();
      return false;
    }
  }

  private async fetchAuthenticatedUser(): Promise<CurrentUser | null> {
    try {
      return await firstValueFrom(
        this.http.get<CurrentUser>(`${baseUrl}/user/`)
      );
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      if (httpError.status === 401 || httpError.status === 403) {
        return null;
      }

      throw error;
    }
  }

  /**
   * Cierra la sesion server-side usando solo las cookies `HttpOnly`.
   */
  private closeServerSession(redirectUrl: string): void {
    if (this.isClosingSession) {
      return;
    }

    this.isClosingSession = true;

    this.http
      .post<ApiMessageResponse>(`${baseUrl}/logout/`, {}, {
        withCredentials: true,
      })
      .pipe(
        catchError(() => of(null)),
        finalize(() => {
          this.clearPersistedSession();
          this.sessionRefreshService.stopPreventiveRefresh();
          this.currUser = null;
          this.syncSessionState();
          this.isClosingSession = false;
          this.router.navigateByUrl(redirectUrl);
        })
      )
      .subscribe();
  }

  private hasSessionRecoveryHint(): boolean {
    return (
      this.storageService.getLocalItem(LoginService.SESSION_RECOVERY_HINT_KEY) ===
      "1"
    );
  }

  private setSessionRecoveryHint(enabled: boolean): void {
    if (enabled) {
      this.storageService.saveLocalItem(
        LoginService.SESSION_RECOVERY_HINT_KEY,
        "1"
      );
      return;
    }

    this.storageService.removeLocalItem(LoginService.SESSION_RECOVERY_HINT_KEY);
  }

  private navigateAfterLogin(): void {
    if (!this.currUser) {
      return;
    }

    if (this.currUser.administrator !== null || this.validateRole("superuser")) {
      this.router.navigate(["admin"]);
      return;
    }

    if (this.validateRole("student")) {
      this.router.navigate(["recommended"]);
    }

    if (this.validateRole("teacher")) {
      this.router.navigate(["settings/my-objects"]);
    }

    if (this.validateRole("expert")) {
      const extras: NavigationExtras = {
        queryParams: {
          is_evaluated: "False",
        },
      };
      this.router.navigate(["search"], extras);
    }
  }

  private hasTeacherOrExpertMenu(user: CurrentUser | null): boolean {
    return !!user?.roles?.some((role) => role === "teacher" || role === "expert");
  }
}
