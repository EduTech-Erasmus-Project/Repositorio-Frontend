import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChangePasswordForm, Concept, Question, QuestionUpdate, User,MetadataUpdate,Metadata, Principle, Guideline, GuidelineUpdate, QuestionStudent, QuestionStudentUpdate, SelfQuestion } from '../admin/models/evaluation.models';
import { RegisterForm } from '../core/interfaces/user-register.interface';
import {
  AdminDashboardLearningObjectSummary,
  AdminDashboardUserSummary,
  ApiCursorPaginatedResponse,
  ApiMessageResponse,
  ApiPaginatedResponse,
  ExpertEvaluationAdminListItemResponse,
  ManagedUserSummary,
  ReportFilterParams,
} from '../core/interfaces/api-contracts';
import { ObjectLearning } from '../core/interfaces/ObjectLearning';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
/**
 * Fachada administrativa principal del backend.
 *
 * Reúne el CRUD heredado de:
 * - usuarios administradores
 * - docentes, expertos y estudiantes
 * - objetos de aprendizaje
 * - preguntas, conceptos y metadatos de evaluación
 * - resúmenes del dashboard
 *
 * Se conserva agrupado porque la UI administrativa actual todavía consume este
 * servicio como punto de entrada único para varios subdominios.
 */
export class AdministratorService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Construye los parámetros comunes para listados administrativos paginados.
   */
  private buildManagedUsersParams(page: number, query?: string): HttpParams {
    let params = new HttpParams().set("page", page.toString());

    const normalizedQuery = query?.trim();
    if (normalizedQuery) {
      params = params.set("query", normalizedQuery);
    }

    return params;
  }
  
  getTotalLearningObjectApprovedAndDisapproved(){
    return this.http.get<AdminDashboardLearningObjectSummary>(`${ baseUrl }/total-oa-approved-and-disapproved/`);
  }
  getTotalTeacherAndExpert(){
    return this.http.get<AdminDashboardUserSummary>(`${ baseUrl }/total-expert-teacher-approved-and-disapproved/`);
  }
  // Evaluation Concept
  postEvaluationExpert(concept: Concept){
    return this.http.post<Concept>(`${ baseUrl }/object-learning-concept-evaluation/`, concept)
  }
  putEvaluationExpert(concept: Concept){
    return this.http.put<Concept>(`${ baseUrl }/object-learning-concept-evaluation/${concept.id}/`, concept)
  }
  getEvaluationExpert(){
    return this.http.get<Concept[]>(`${ baseUrl }/object-learning-concept-evaluation/`);
  }
  retrieveEvaluationExpert(id: number){
    return this.http.get<Concept>(`${ baseUrl }/object-learning-concept-evaluation/${id}/`);
  }
  deleteEvaluationExpert(id: number){
    return this.http.delete<ApiMessageResponse>(`${ baseUrl }/object-learning-concept-evaluation/${id}/`);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////
  //estudiante
  getEvaluationStudent(){
    return this.http.get<Principle[]>(`${ baseUrl }/learning-objects/student-register-principles/`);
  }
  deleteEvaluationStudent(id: number){
    return this.http.delete<ApiMessageResponse>(`${ baseUrl }/learning-objects/student-register-principles/${id}/`);
  }
  putEvaluationStudent(principle: Principle){
    return this.http.put<Principle>(`${ baseUrl }/learning-objects/student-register-principles/${principle.id}/`, principle)
  }
  retrieveEvaluationStudent(id: number){
    return this.http.get<Principle>(`${ baseUrl }/learning-objects/student-register-principles/${id}/`);
  }
  postEvaluationStudent(principle: Principle){
    return this.http.post<Principle>(`${ baseUrl }/learning-objects/student-register-principles/`, principle)
  }
  //////
  postGuidelineStudent(guideline: Guideline){
    return this.http.post<Guideline>(`${ baseUrl }/learning-objects/student-register-guideline/`, guideline);
  }
  updateGuidelineStudent(guideline: GuidelineUpdate){
    return this.http.put<GuidelineUpdate>(`${ baseUrl }/learning-objects/student-register-guideline/${guideline.id}/`,guideline);
  }
  deleteGuidelineStudent(principleId: number){
    return this.http.delete<ApiMessageResponse>(`${ baseUrl }/learning-objects/student-register-guideline/${principleId}/`);
  }
  /////questions
  retrieveEvaluationStudentquestions(id: number){
    return this.http.get<Guideline>(`${ baseUrl }/object-learning-concept-evaluation-student-questions/${id}/`);
  }//
  postQuestionStudent(question: QuestionStudent){
    return this.http.post<QuestionStudent>(`${ baseUrl }/learning-objective-assessment-student/`, question);
  }
  deleteQuestionStudent(principleId: number){
    return this.http.delete<ApiMessageResponse>(`${ baseUrl }/learning-objective-assessment-student/${principleId}/`);
  }
  updateQuestionStudent(question: QuestionStudentUpdate){
    return this.http.put<QuestionStudentUpdate>(`${ baseUrl }/learning-objective-assessment-student/${question.id}/`,question);
  }
  
  deleteSelfQuestion(id : number){
    return this.http.delete<ApiMessageResponse>(`${baseUrl}/learning-objects/object-learning-question-evaluation-schema-delete/${id}`);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //NUEVA EVALUACION AUTOMATICA <---revisar los metodos del cruo para update eliminar y actualizar
  postEvaluationAutomatic(concept: Concept){
    return this.http.post<Concept>(`${ baseUrl }/object-learning-concept-evaluation-schema/`, concept)
  }

  postEvaluationAutomaticQuestion(concept: SelfQuestion){
    return this.http.post<SelfQuestion>(`${ baseUrl }/object-learning-question-evaluation-schema/`, concept)
  }

  putEvaluationAutomatic(concept: Concept){
    return this.http.put<Concept>(`${ baseUrl }/object-learning-concept-evaluation-schema/${concept.id}/`, concept)
  }

  putEvaluationAutomaticQuestion(selfQuestion: SelfQuestion){
    return this.http.put<SelfQuestion>(`${ baseUrl }/object-learning-question-evaluation-schema/${selfQuestion.id}/`, selfQuestion)
  }

  getEvaluationAutomatic(){
    return this.http.get<Concept[]>(`${ baseUrl }/object-learning-concept-evaluation-schema/`);
  }
  getEvaluationAutomaticQuestion(){
    return this.http.get<SelfQuestion[]>(`${ baseUrl }/object-learning-question-evaluation-schema/`);
  }

  retrieveEvaluationAutomatic(id: number){
    return this.http.get<Concept>(`${ baseUrl }/object-learning-concept-evaluation-schema/${id}/`);
  }

  retrieveEvaluationAutomaticQuestion(id: number){
    return this.http.get<SelfQuestion>(`${ baseUrl }/object-learning-question-evaluation-schema/${id}/`);
  }

  deleteEvaluationAutomatic(id: number){
    return this.http.delete<ApiMessageResponse>(`${ baseUrl }/object-learning-concept-evaluation-schema/${id}/`);
  } 

  putRelatioshipQuestionMetadata(data:Record<string, unknown>){
    return this.http.put<ApiMessageResponse>(`${baseUrl}/learning-objects/add-metadata-question-relationship/`,data);
  }
  
  deleteRelatioshipQuestionMetadata(data:{ id_schema: number }){
    return this.http.delete<ApiMessageResponse>(`${baseUrl}/learning-objects/add-metadata-question-relationship/${data.id_schema}`);
  }
  /////Evaluacion Metadatas <---revisar los metodos del cruo para update eliminar y actualizar
  postMetadataExpert(schema: Metadata){
    return this.http.post<Metadata>(`${ baseUrl }/learning-objective-assessment-schema/`, schema);
  }
  updateMetadataExpert(schema: MetadataUpdate){
    const payload = {
      schema: schema.schema,
      code: schema.code,
      description: schema.description,
      value_importance_schema: schema.value_importance_schema
    };

    return this.http.put<MetadataUpdate>(`${ baseUrl }/learning-objective-assessment-schema/${schema.id}/`, payload);
  }
  
  deleteMetadataExpert(conceptId: number){
    return this.http.delete<ApiMessageResponse>(`${ baseUrl }/learning-objective-assessment-schema/${conceptId}/`);
  }
  
  getMetadataConceptQuestionsExpert(){
    return this.http.get<Metadata[]>(`${ baseUrl }/learning-objective-assessment-schema/`);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Evaluation Questions
  postQuestionExpert(question: Question){
    return this.http.post<Question>(`${ baseUrl }/learning-objective-assessment-questions/`, question);
  }
  getQuestionExpert(conceptId: number){
    return this.http.get<Question>(`${ baseUrl }/learning-objective-assessment-questions/${conceptId}/`);
  }
  deleteQuestionExpert(conceptId: number){
    return this.http.delete<ApiMessageResponse>(`${ baseUrl }/learning-objective-assessment-questions/${conceptId}/`);
  }
  updateQuestionExpert(question: QuestionUpdate){
    return this.http.put<QuestionUpdate>(`${ baseUrl }/learning-objective-assessment-questions/${question.id}/`,question);
  }
  // Teacher upload
  listLearningObjectUploadByTeacher(teacherId: number){
    return this.http.get<ApiPaginatedResponse<ObjectLearning>>(`${ baseUrl }/learning-objects/upload-teacher/${teacherId}/`);
  }

  // Administrator
  registerAdministratorUser(formData: RegisterForm,){
    return this.http.post<ManagedUserSummary>(`${ baseUrl }/management-administrator/`, formData)
  }
  updateAdministratorDataUser(user: User){
    const data = {
      'first_name':user.first_name,
      'last_name':user.last_name,
      'country':user.administrator.country,
      'city':user.administrator.city,
      'phone':user.administrator.phone
    }
    return this.http.put<ManagedUserSummary>(`${ baseUrl }/management-administrator/${user.id}/`,data);
  }
  getAdministratorUser(userId: number){
    return this.http.get<ManagedUserSummary>(`${ baseUrl }/management-administrator/${userId}/`)
  }
  changePassword(id:number,data: ChangePasswordForm){
    return this.http.put<ApiMessageResponse>(`${ baseUrl }/user/change_password/${id}/`,data);
  }
  // Superuser
  listAdministratorUser(){
    return this.http.get<ManagedUserSummary[]>(`${ baseUrl }/management-superuser/`);
  }
  updateAdministratorUser(id: number, status: number){
    const data = {
      'administrator_is_active':status
    }
    return this.http.put<ManagedUserSummary>(`${ baseUrl }/management-superuser/${id}/`,data);
  }
  // Objetos de Aprendizaje
  /**
   * Lista OA aprobados o pendientes segun el status administrativo solicitado.
   */
  listLearningObject(status: number, data_filter:ReportFilterParams | null = null){
    return this.http.get<ApiPaginatedResponse<ObjectLearning>>(`${ baseUrl }/learning-objects-approved-and-disapproved/${status}/`, {params:data_filter || undefined});
  }

  //Listar los objetos de aprendizaje con paginacion
  listLearningObjectPagination(status: number, page : number){
    return this.http.get<ApiPaginatedResponse<ObjectLearning>>(`${ baseUrl }/learning-objects-approved-and-disapproved/${status}/?page=${page}`);
  }

  updatePublicandPrivateLearningObject(id: number, status: number){
   const data = {
      'public':status
    }
    return this.http.patch<ObjectLearning>(`${ baseUrl }/learning-objects-update-public/${id}/`,data);
  }
  getLearningObject(slug: string){
    return this.http.get<ObjectLearning>(`${ baseUrl }/learning-object/${slug}/`);
  }
  
  getExpertToAprove(page: number = 1, query: string = ""){
    return this.http.get<ApiCursorPaginatedResponse<ManagedUserSummary>>(`${ baseUrl }/expert-to-approve/`, {
      params: this.buildManagedUsersParams(page, query)
    });
  }

  getTeacherToAprove(page: number = 1, query: string = ""){
    return this.http.get<ApiCursorPaginatedResponse<ManagedUserSummary>>(`${ baseUrl }/teacher-to-approve/`, {
      params: this.buildManagedUsersParams(page, query)
    });
  }

  getTeacherAndExpertToAproveProfile(id: number){
    return this.http.get<ManagedUserSummary>(`${ baseUrl }/teacher-to-disapproved/${id}`);
  }
  
  getTeacherAproved(page: number = 1, query: string = ""){
    return this.http.get<ApiCursorPaginatedResponse<ManagedUserSummary>>(`${ baseUrl }/teacher-approved/`, {
      params: this.buildManagedUsersParams(page, query)
    });
  }

  /**
   * Lista expertos ya aprobados usando paginacion server-side.
   */
  getExpertAproved(page: number = 1, query: string = ""){
    return this.http.get<ApiCursorPaginatedResponse<ManagedUserSummary>>(`${ baseUrl }/expert-approved/`, {
      params: this.buildManagedUsersParams(page, query)
    });
  }

  getTeacherAndExpertprovedProfile(id: number){
    return this.http.get<ManagedUserSummary>(`${ baseUrl }/teacher-to-approve/${id}`);
  }
  // updateTeacherAndExpertToAprove(id:number,teacher_status:number,expert_status: number){
  //   let data = {
  //     'teacher_is_active':teacher_status,
  //     'expert_is_active':expert_status
  //   }
  //   return this.http.put(`${ baseUrl }/teacher-expert-to-approve/${id}/`,data);
  // }

  updateTeacherToAprove(id:number,teacher_status:number,expert_status: number){
    const data = this.buildApprovalStatusPayload(teacher_status, expert_status);
    return this.http.put<ManagedUserSummary>(`${ baseUrl }/teacher-to-approve/${id}/`,data);
  }

  /**
   * Funcion para eliminar el usuario de tipo profesor
   * @param idUser 
   * @method deleteUserTeacher
   */
  public deleteUserTeacher(idUser:number){
    return this.http.delete<ApiMessageResponse>(`${ baseUrl }/teacher-to-approve-delete/${idUser}`);
  }

  /**
   * Funcion para eliminar el usuario logueado como 
   * experto colaborador 
   * @param idUser 
   */
  public deleteUserExpert(idUser:number) {
    return this.http.delete<ApiMessageResponse>(`${baseUrl}/expert-to-approve-delete/${idUser}`);
  } 

  updateCollaboratingExpertToAprove(id:number,teacher_status:number,expert_status: number){
    const data = this.buildApprovalStatusPayload(teacher_status, expert_status);
    return this.http.put<ManagedUserSummary>(`${ baseUrl }/expert-to-approve/${id}/`,data);
  }

  // updateTeacherAndExpertAproved(id:number,teacher_status:number,expert_status: number){
  //   let data = {
  //     'teacher_is_active':teacher_status,
  //     'expert_is_active':expert_status
  //   }
  //   return this.http.put(`${ baseUrl }/teacher-expert-approved/${id}/`,data);
  // }

  updateTeacherAproved(id:number,teacher_status:number,expert_status: number){
    const data = this.buildApprovalStatusPayload(teacher_status, expert_status);
    return this.http.put<ManagedUserSummary>(`${ baseUrl }/teacher-approved/${id}/`,data);
  }

  updateCollaboratingExpertAproved(id:number,teacher_status:number,expert_status: number){
    const data = this.buildApprovalStatusPayload(teacher_status, expert_status);
    return this.http.put<ManagedUserSummary>(`${ baseUrl }/expert-approved/${id}/`,data);
  }

  getLearningObjectEvaluatedByExpert(id:number){
    return this.http.get<ApiPaginatedResponse<ExpertEvaluationAdminListItemResponse>>(`${ baseUrl }/learning-objects/evaluated-expert/${id}`);
  }

  /**
   * Lista estudiantes visibles para administracion con paginacion server-side.
   */
  getStudentList(page: number = 1, query: string = ""){
    return this.http.get<ApiCursorPaginatedResponse<ManagedUserSummary>>(`${ baseUrl }/student-list/by-admin/`, {
      params: this.buildManagedUsersParams(page, query)
    });
  }

  private buildApprovalStatusPayload(teacherStatus: number, expertStatus: number) {
    return {
      teacher_is_active: teacherStatus,
      expert_is_active: expertStatus
    };
  }
}
