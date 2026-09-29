import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { map, catchError } from "rxjs/operators";
import { AuthTokenResponse } from "../core/interfaces/api-contracts";


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root",
})
/**
 * Encapsula la verificacion y renovacion de sesion del frontend.
 *
 * Desde `H1.4` el servicio ya no lee ni persiste tokens en `localStorage`;
 * toda renovacion ocurre contra el backend usando cookies `HttpOnly`.
 */
export class TokenService {
  constructor(private http: HttpClient) {}

  /**
   * Verifica si un refresh token sigue siendo valido para la sesion actual.
   */
  validateToken(token: string): Observable<boolean> {
    const body = {
      token,
    };

    return this.http
      .post<{ detail?: string } | Record<string, unknown>>(`${baseUrl}/token/verify/`, body)
      .pipe(
      map((resp) => (resp?.detail ? false : true)),
      catchError(() => of(false))
    );
  }

  /**
   * Solicita la renovacion de sesion usando solo la cookie `HttpOnly` del backend.
   */
  refreshToken(): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${baseUrl}/token/refresh/`, {});
  }
}
