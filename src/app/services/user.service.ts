import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { CurrentUser } from "../core/interfaces/CurrentUser";
import { ApiMessageResponse, ManagedUserSummary } from "../core/interfaces/api-contracts";
import { UserGeneral } from "../core/models/userGeneral";
import { normalizeMultilineMessage } from "../core/utils/multiline-message.utils";

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root"
})
/**
 * Servicio de perfil para el usuario autenticado.
 *
 * Proposito:
 * - Encapsular las operaciones públicas de consulta y actualización del
 *   usuario final.
 *
 * Responsabilidades:
 * - Consultar detalle del perfil.
 * - Actualizar datos y foto.
 * - Coordinar verificación de correo.
 * - Enviar el formulario de contacto público.
 */
export class UserService {
  constructor(private readonly http: HttpClient) { }

  /**
   * Registra un nuevo usuario publico usando el endpoint central de usuarios.
   */
  registerUser(user: UserGeneral) {
    return this.http.post<ManagedUserSummary>(`${baseUrl}/user-management/`, user);
  }

  /**
   * Recupera el detalle completo del usuario autenticado para `profile`.
   */
  getUserDetail(id: number) {
    return this.http.get<CurrentUser & Record<string, unknown>>(`${baseUrl}/user-management/${id}`);
  }

  /**
   * Actualiza los datos generales del perfil usando el endpoint central de usuarios.
   */
  updateUser(user: UserGeneral) {
    return this.http.put<CurrentUser & Record<string, unknown>>(
      `${baseUrl}/user-management/${user.id}/`,
      user
    );
  }

  /**
   * Actualiza la foto de perfil del usuario autenticado.
   */
  updateImage(file: File, userId: number) {
    const formData = new FormData();
    formData.append("image", file);

    return this.http.put<CurrentUser & Record<string, unknown>>(
      `${baseUrl}/user/photo/${userId}/`,
      formData
    );
  }

  sent_email_token_verify(token: string, email: string) {
    return this.http.get<ApiMessageResponse>(`${baseUrl}/email-verify/${token}/${email}`);
  }

  /**
   * Solicita un nuevo enlace de verificacion para cuentas aun no activadas.
   */
  set_email_verify_new_token(email: string) {
    return this.http.post<ApiMessageResponse>(`${baseUrl}/set-verify/`, { email });
  }

  /**
   * Envía el formulario público de contacto al backend.
   */
  sendContactEmail(data: { name: string; email: string; message: string }) {
    return this.http.post<ApiMessageResponse>(
      `${baseUrl}/contact-email/`,
      this.buildContactEmailFormData(data)
    );
  }

  private buildContactEmailFormData(data: { name: string; email: string; message: string }): FormData {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("content", normalizeMultilineMessage(data.message));
    return formData;
  }
}
