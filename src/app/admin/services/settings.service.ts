import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  ApiMessageResponse,
  DomainBackendType,
  EmailDomainPayload,
  EmailDomainListResponse,
  EmailDomainResponse,
  EmailServerConfigPayload,
  EmailServerConfigResponse,
  EmailServerTestPayload,
  OptionRegisterResponse,
  TypeUserOptionRegisterResponse,
} from "src/app/core/interfaces/api-contracts";

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root",
})
/**
 * Servicio administrativo para configuración institucional de registro y correo.
 *
 * Maneja dominios permitidos por rol, configuración del servidor de correo y
 * opciones de registro consumidas por el panel administrativo.
 */
export class SettingsService {
  constructor(private readonly http: HttpClient) {}

  getDomainsTeacher(id_option:number) {
    return this.getDomainsByType("TEACHER", id_option);
  }

  getDomainExpert(id_option:number){
    return this.getDomainsByType("EXPERT", id_option);
  }

  getDomainStudent(id_option:number){
    return this.getDomainsByType("STUDENT", id_option);
  }

  getDomain(id: number, value: DomainBackendType) {
    return this.http.get<EmailDomainResponse>(`${baseUrl}/settings/email-domain/${id}?type=${value}`);
  }

 getOptionRegister(){
  return this.http.get<OptionRegisterResponse[]>(`${baseUrl}/settings/option-register/`);
 } 

  createDomain(data: EmailDomainPayload) {
    return this.http.post<EmailDomainResponse>(`${baseUrl}/settings/email-domain/`, data);
  }

  updateDomain(id: number, data: EmailDomainPayload, value: DomainBackendType) {
    return this.http.put<EmailDomainResponse>(`${baseUrl}/settings/email-domain-update/${id}?type=${value}`, data);
  }

  deleteDomain(id: number) {
    return this.http.delete<ApiMessageResponse>(`${baseUrl}/settings/email-domain/${id}`);
  }

  getDomainsActive() {
    return this.http.get<EmailDomainResponse[]>(`${baseUrl}/settings/email-domain/active`);
  }

  getOrCreateServer(){
    return this.http.get<EmailServerConfigResponse>(`${baseUrl}/settings/email/`);
  }

  updateServer(data: EmailServerConfigPayload){
    return this.http.post<EmailServerConfigResponse>(`${baseUrl}/settings/email/`, data);
  }

  testServer(data: EmailServerTestPayload){
    return this.http.post<ApiMessageResponse>(`${baseUrl}/settings/email-testing/`, data);
  }


  getTypeUserOptionRegister(){
    return this.http.get<TypeUserOptionRegisterResponse[]>(`${baseUrl}/settings/type-user-option-register/`);
  }
  updateTypeUserOptionRegister(data: Record<string, unknown>,id: number){
    return this.http.put<TypeUserOptionRegisterResponse>(`${baseUrl}/settings/type-user-option-register-update/${id}`,data);
  }

  private getDomainsByType(type: DomainBackendType, optionId: number) {
    return this.http.get<EmailDomainListResponse>(
      `${baseUrl}/settings/email-domain?type=${type}&option=${optionId}`
    );
  }
}
