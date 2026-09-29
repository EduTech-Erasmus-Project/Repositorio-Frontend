import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { QuerySearch } from '../core/interfaces/Search';
import { ObjectLearning } from '../core/interfaces/ObjectLearning';
import { KnowledgeArea } from '../core/interfaces/KnowledgeArea';
import { Preference } from '../core/interfaces/Preference';
import { EducationLevel } from '../core/interfaces/EducationLevel';
import { License } from '../core/interfaces/License';
import {
  ApiMessageResponse,
  ApiPaginatedResponse,
  CreatedYearResponse,
  EmailDomainListResponse,
  ExpertConceptResponse,
  ManagedUserSummary,
  OptionRegisterResponse,
  ApiValuesResponse,
  LearningObjectApprovedCountSummary,
  PreferenceAreaGroupResponse,
  SearchFilterAreaGroupResponse,
  StudentEvaluationResultResponse,
  StudentPrincipleResponse,
  TypeUserOptionRegisterResponse,
  UserCountSummary,
} from '../core/interfaces/api-contracts';
const baseUrl = environment.baseUrl;

type HttpQueryParams = Record<
  string,
  string | number | boolean | ReadonlyArray<string | number | boolean>
>;

@Injectable({
  providedIn: 'root'
})
/**
 * Servicio de descubrimiento publico y catálogos de apoyo.
 *
 * Centraliza la búsqueda de objetos de aprendizaje y los catálogos usados por
 * filtros, registro y evaluaciones públicas.
 */
export class SearchService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Normaliza los query params para que `HttpClient` los serialice sin perder
   * arreglos ni flags usados por el backend de búsqueda.
   */
  private toHttpQueryParams(
    queryParams: QuerySearch | HttpQueryParams = {}
  ): HttpQueryParams {
    return queryParams as HttpQueryParams;
  }

  countUsers(): Observable<UserCountSummary> {
    return this.http.get<UserCountSummary>(`${ baseUrl }/user-count/`);
  }
 
  countObjectLearning(): Observable<LearningObjectApprovedCountSummary> {
    return this.http.get<LearningObjectApprovedCountSummary>(`${ baseUrl }/total-oa-approved/`);
  }

  getInterestAreas(): Observable<ApiValuesResponse<KnowledgeArea>> {
    return this.http.get<ApiValuesResponse<KnowledgeArea>>(`${ baseUrl }/knowledge-area/`);
  }

  getPreferences(): Observable<Preference[]> {
    return this.http.get<Preference[]>(`${ baseUrl }/user-preferences/`);
  }

  getLevelEducation(): Observable<ApiValuesResponse<EducationLevel>> {
    return this.http.get<ApiValuesResponse<EducationLevel>>(`${ baseUrl }/education-level/`);
  }

  /**
   * Ejecuta la busqueda publica principal consumida por `search` y `home`.
   */
  search(queryParams: QuerySearch | HttpQueryParams): Observable<ApiPaginatedResponse<ObjectLearning>> {
    return this.http.get<ApiPaginatedResponse<ObjectLearning>>(`${ baseUrl }/learning-objects/search/`, {
      params: this.toHttpQueryParams(queryParams),
    });
  }

  searchPagePaginator(
    page:number,
    queryParams: QuerySearch | HttpQueryParams = {}
  ): Observable<ApiPaginatedResponse<ObjectLearning>> {
    return this.http.get<ApiPaginatedResponse<ObjectLearning>>(`${ baseUrl }/learning-objects/search/`, {
      params: {
        ...this.toHttpQueryParams(queryParams),
        page
      }
    });
  }
  
  searchExpert(queryParams: QuerySearch | HttpQueryParams): Observable<ApiPaginatedResponse<ObjectLearning>> {
    return this.http.get<ApiPaginatedResponse<ObjectLearning>>(`${ baseUrl }/learning-objects/search/expert/`, {
      params: this.toHttpQueryParams(queryParams),
    });
  }

  //user function 
  getProfession(): Observable<KnowledgeArea[]>{
    return this.http.get<KnowledgeArea[]>(`${ baseUrl }/profession/`);
  }
  
  //getPeferencesAreas
  getPreferencesArea(): Observable<PreferenceAreaGroupResponse[]>{
    return this.http.get<PreferenceAreaGroupResponse[]>(`${ baseUrl }/preferences-area/`);
  }


  /**
   * Devuelve los dominios permitidos por rol y opcion de registro.
   */
  getEmailExtension(option_register: number, type: string): Observable<EmailDomainListResponse>{
    return this.http.get<EmailDomainListResponse>(`${ baseUrl }/settings/email-domain?type=${type}&&option=${option_register}`);
  }

  getTypeUserProfile(): Observable<TypeUserOptionRegisterResponse[]>{
    return this.http.get<TypeUserOptionRegisterResponse[]>(`${baseUrl}/settings/type-user-option-register/`);
  }

  /**
   * Recupera la matriz de preguntas de evaluación para estudiantes.
   */
  geQuestionsStudent(): Observable<StudentPrincipleResponse[]>{
    return this.http.get<StudentPrincipleResponse[]>(`${ baseUrl }/learning-objects-questions/student/`);
  }

  getCreatedYear(): Observable<CreatedYearResponse[]>{
    return this.http.get<CreatedYearResponse[]>(`${ baseUrl }/learning-objects/years/`);
  }

  getLicenses(): Observable<ApiValuesResponse<License>> {
    return this.http.get<ApiValuesResponse<License>>(`${ baseUrl }/license/`);
  }
  
  /**
   * Recupera la matriz de preguntas de evaluación para expertos.
   */
  geQuestionsExpert(): Observable<ExpertConceptResponse[]>{
    return this.http.get<ExpertConceptResponse[]>(`${ baseUrl }/learning-objects-questions/expert/`);
  }

  getTokenRestPassword(uidb64:string, token:string): Observable<ApiMessageResponse>{
    return this.http.get<ApiMessageResponse>(`${ baseUrl }/password-resed/${uidb64}/${token}/`);
  }

  /**
   * Devuelve las áreas configuradas para el filtro lateral de búsqueda.
   *
   * Se mantiene el nombre legacy porque la UI activa ya consume esta firma.
   */
  getgetFilterArea(): Observable<SearchFilterAreaGroupResponse[]>{
    return this.http.get<SearchFilterAreaGroupResponse[]>(`${ baseUrl }/learning-object/filters/area`);
  }
  getObjectResultsEvaluationStudent(id: number | string): Observable<StudentEvaluationResultResponse[]>{
    return this.http.get<StudentEvaluationResultResponse[]>(`${baseUrl}/learning-objects/student/result-to-student/${id}/`);
    }
}
