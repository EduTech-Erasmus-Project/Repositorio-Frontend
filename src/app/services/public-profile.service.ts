import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { ApiPaginatedResponse } from "../core/interfaces/api-contracts";
import {
  AuthorLearningObject,
  OwnPublicProfile,
  OwnPublicProfileUpdate,
  PublicAuthor,
} from "../core/interfaces/PublicProfile";

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root"
})
/**
 * Servicio del perfil publico del docente.
 *
 * Responsabilidades:
 * - Leer y guardar el perfil propio del docente autenticado.
 * - Consultar el perfil publico de un autor y su grilla de OA.
 *
 * No responsabilidades:
 * - Filtrar campos privados: lo hace el backend.
 */
export class PublicProfileService {
  constructor(private readonly http: HttpClient) { }

  /**
   * Perfil propio completo, incluido lo marcado como "Solo yo".
   */
  getOwnProfile() {
    return this.http.get<OwnPublicProfile>(`${baseUrl}/user/public-profile/`);
  }

  /**
   * Guarda todo el perfil propio en una sola peticion.
   */
  saveOwnProfile(profile: OwnPublicProfileUpdate) {
    return this.http.put<OwnPublicProfile>(`${baseUrl}/user/public-profile/`, profile);
  }

  /**
   * Guarda solo los campos enviados (por ejemplo, el interruptor `is_public`).
   */
  patchOwnProfile(changes: OwnPublicProfileUpdate) {
    return this.http.patch<OwnPublicProfile>(`${baseUrl}/user/public-profile/`, changes);
  }

  /**
   * Perfil publico de un autor. Responde 404 si no se puede mostrar.
   */
  getAuthor(userKey: string) {
    return this.http.get<PublicAuthor>(`${baseUrl}/authors/${encodeURIComponent(userKey)}/`);
  }

  /**
   * OA publicos del autor. Sin `pageSize` el backend pagina de 10 en 10.
   */
  getAuthorLearningObjects(userKey: string, page = 1, pageSize?: number) {
    let params = new HttpParams().set("page", page);
    if (pageSize) {
      params = params.set("page_size", pageSize);
    }
    return this.http.get<ApiPaginatedResponse<AuthorLearningObject>>(
      `${baseUrl}/authors/${encodeURIComponent(userKey)}/learning-objects/`,
      { params }
    );
  }
}
