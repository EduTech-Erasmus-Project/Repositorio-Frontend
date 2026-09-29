import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ApiPaginatedResponse,
  ManagedUserSummary,
  ReportFilterParams,
} from 'src/app/core/interfaces/api-contracts';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
/**
 * Consultas administrativas vigentes para listados y reportes de superadmin.
 *
 * Los metodos legacy basados en `/api/usuario-administrador/` se retiraron
 * porque no tenian consumo real y apuntaban a endpoints inexistentes.
 */
export class UserService {
  constructor(private readonly http: HttpClient) {}

  listAdministratorUser() {
    return this.http.get<ManagedUserSummary[]>(`${baseUrl}/management-superuser/`);
  }

  getReportUsers(params: ReportFilterParams) {
    return this.http.get<ApiPaginatedResponse<ManagedUserSummary> | ManagedUserSummary[]>(`${baseUrl}/report`, { params });
  }
}
