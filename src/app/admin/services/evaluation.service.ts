import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ApiMessageResponse,
  ApiPaginatedResponse,
  ExpertEvaluationAdminListItemResponse,
  ExpertEvaluationResultResponse,
  StudentEvaluationAdminListItemResponse,
  StudentEvaluationResultResponse,
} from 'src/app/core/interfaces/api-contracts';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
/**
 * Consultas vigentes del panel admin para revisar resultados de evaluacion.
 *
 * Los metodos legacy de conceptos sobre `/api/objeto-de-aprendizaje/...`
 * se retiraron porque no tenian consumo real y el flujo activo ya usa
 * `AdministratorService` con endpoints modernos.
 */
export class EvaluationService {
  constructor(private readonly http: HttpClient) {}

  get_qualification_expert_results(id: number) {
    return this.http.get<ApiPaginatedResponse<ExpertEvaluationAdminListItemResponse>>(`${baseUrl}/learning-objects/evaluated-expert-qualification/${id}`);
  }

  update_qualification_expert_results(id: number, data: Record<string, unknown>) {
    return this.http.put<ApiMessageResponse>(`${baseUrl}/learning-objects/evaluated-expert-update/${id}`, data);
  }

  get_qualification_student_results(id: number) {
    return this.http.get<ApiPaginatedResponse<StudentEvaluationAdminListItemResponse>>(`${baseUrl}/learning-objects/evaluated-student-qualification/${id}`);
  }

  getObjectResultsEvaluationStudentResult_Admin(id_user: number, id_oa: number) {
    return this.http.get<StudentEvaluationResultResponse[]>(`${baseUrl}/learning-objects/evaluated-student-qualification-results/${id_user}/${id_oa}`);
  }

  getObjectResultsEvaluationExpertResult_Admin(id_user: number, id_oa: number) {
    return this.http.get<ExpertEvaluationResultResponse[]>(`${baseUrl}/learning-objects/evaluated-expert-qualification-results/${id_user}/${id_oa}`);
  }
}
