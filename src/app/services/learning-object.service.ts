import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";
import { AnswerAnswerEvaluationResponse } from "../core/interfaces/QuestionEvaluation";
import { ObjectLearning } from "../core/interfaces/ObjectLearning";
import {
  ApiMessageResponse,
  ApiPaginatedResponse,
  ApiReferenceResponse,
  AutomaticEvaluationResultResponse,
  CommentCreateResponse,
  ExpertEvaluationResultResponse,
  ExpertPriorityEvaluationResponse,
  LearningObjectDownloadCountResponse,
  LearningObjectInteractionResponse,
  LearningObjectLikesTotalResponse,
  LearningObjectViewCountResponse,
  OerIntegrationResponse,
  StudentEvaluationResultResponse,
  StudentPublicEvaluationResultResponse,
  ViewedLearningObjectItemResponse,
} from "../core/interfaces/api-contracts";
import { objectToFormData } from "../core/utils/form-data.utils";
import { normalizeMultilineMessage } from "../core/utils/multiline-message.utils";

const baseUrl = environment.baseUrl;
const baseUrlOer = environment.oerUrl;
const INTERACTION_REFERENCE_BOOTSTRAP_KEY = "@-rcxionqt";
@Injectable({
  providedIn: "root",
})
/**
 * Servicio principal del dominio de objetos de aprendizaje.
 *
 * Agrupa operaciones de detalle, metadata, comentarios, interacciones,
 * evaluaciones y flujos de integración externa con OER-ADAP.
 */
export class LearningObjectService {
  private readonly selectedLearningObjectSource = new Subject<ObjectLearning>();
  readonly selectedLearningObject$ = this.selectedLearningObjectSource.asObservable();

  constructor(private readonly http: HttpClient) {}

  /**
   * Publica el objeto actualmente seleccionado para componentes acoplados al
   * detalle del OA.
   */
  setSelectedLearningObject(object: ObjectLearning): void {
    this.selectedLearningObjectSource.next(object);
  }

  getLearningObject() {
    return this.http.get<ObjectLearning[]>(`${baseUrl}/areas-de-conocimiento/`);
  }

  /**
   * Carga el paquete fuente del OA antes del registro completo de metadata.
   */
  uploadObject(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post(`${baseUrl}/learning-object-file/`, formData);
  }

  get urlUpload() {
    return `${baseUrl}/learning-object-file/`;
  }

  getObjectDetail(slug: string) {
    return this.http.get<ObjectLearning>(`${baseUrl}/learning-object/${slug}/`);
  }

  getObjectDetailById(id: number) {
    return this.http.get<ObjectLearning>(`${baseUrl}/learning-object-metadata/${id}/`);
  }

  getComments(id: number) {
    return this.http.get<unknown[]>(`${baseUrl}/learning-objects/comments/${id}`);
  }

  /**
   * Registra un comentario asociado al detalle publico de un OA.
   */
  addComent(formData: Record<string, unknown>) {
    return this.http.post<CommentCreateResponse>(
      `${baseUrl}/learning-object/create/commentary/`,
      formData
    );
  }

  addQuestionQualificationLearningObject(data :AnswerAnswerEvaluationResponse){
    return this.http.post(`${baseUrl}/learning-objects/add-metadata-self-question`,data);
  }

  /**
   * Serializa el formulario de metadata a `FormData` manteniendo la convención
   * que el backend espera en alta y edición.
   */
  addMetadata(object: Record<string, unknown>) {
    const formData = objectToFormData(object);
    return this.http.post<ObjectLearning>(`${baseUrl}/learning-object-metadata/`, formData);
  }

  editMetadata(object: Record<string, unknown> & { id: number }) {
    const formData = objectToFormData(object);
    return this.http.patch<ObjectLearning>(
      `${baseUrl}/learning-object-metadata/${object.id}/`,
      formData
    );
  }

  sendQualificationExpert(data: Record<string, unknown>) {
    return this.http.post<ApiMessageResponse>(
      baseUrl + "/learning-objects/register-evaluation-expert/",
      data
    );
  }

  /**
   * Actualiza una evaluacion experta ya registrada sobre el OA.
   */
  sendQualificationExpertUpdate(data: Record<string, unknown>, id: number) {
    return this.http.put<ApiMessageResponse>(
      `${baseUrl}/learning-objects/register-evaluation-expert/${id}/`,
      data
    );
  }

  ////////////////estudiante
  sendQualificationStudent(data: Record<string, unknown>) {
    return this.http.post<ApiMessageResponse>(
      baseUrl + "/learning-objects/student-evaluation/",
      data
    );
  }

  /**
   * Actualiza la evaluacion estudiantil previamente registrada.
   */
  sendQualificationStudentUpdate(data: Record<string, unknown>, id: number) {
    return this.http.put<ApiMessageResponse>(
      `${baseUrl}/learning-objects/student-evaluation/${id}/`,
      data
    );
  }

  validateLike(id: number) {
    return this.http.get<LearningObjectInteractionResponse>(`${baseUrl}/learning-objects/liked/${id}`);
  }

  downloadCreateCount(data: Record<string, unknown>){
    return this.http.post<LearningObjectInteractionResponse[]>(`${baseUrl}/learning-objects/downloaded`, data);
  }

  downloadUpdateCount(data: Record<string, unknown>, learningObjectId: number){
    return this.http.put<LearningObjectInteractionResponse[]>(`${baseUrl}/learning-objects/downloaded/${learningObjectId}`, data);
  }

  getdownloadCount(learningObjectId: number){
    return this.http.get<LearningObjectDownloadCountResponse>(`${baseUrl}/learning-objects/downloaded/${learningObjectId}`);
  }


 viewedCreateCount(data: Record<string, unknown>){
    return this.http.post<LearningObjectViewCountResponse>(`${baseUrl}/learning-objects/viewed`, data);
  }

  viewedUpdateCount(data: Record<string, unknown>, learningObjectId: number){
    return this.http.put<LearningObjectViewCountResponse>(`${baseUrl}/learning-objects/viewed/${learningObjectId}`, data);
  }

  getViewedCount(learningObjectId: number){
    return this.http.get<LearningObjectViewCountResponse[]>(`${baseUrl}/learning-objects/viewed/${learningObjectId}`);
  }


  getRecommendedObjects() {
    return this.http.get<ObjectLearning[]>(`${baseUrl}/learning-objects/recommended/`);
  }

  getResultsEvaluation(id: number) {
    return this.http.get<ExpertEvaluationResultResponse[]>(`${baseUrl}/learning-objects/evaluations-result-expert/${id}`);
  }

  getResultsEvaluationPriority(id: number) {
    return this.http.get<ExpertPriorityEvaluationResponse[]>(
      `${baseUrl}/learning-objects/evaluations-result-expert-priority/${id}`
    );
  }

  getResultsEvaluationSingle(id: number) {
    return this.http.get<ExpertPriorityEvaluationResponse[]>(
      `${baseUrl}/learning-objects/evaluations-result-expert-single/${id}`
    );
  }

  interactionLike(body: Record<string, unknown> & { id: number }) {
    return this.http.put<LearningObjectInteractionResponse>(
      `${baseUrl}/object-learning/interaction/${body.id}/`,
      body
    );
  }
  interactionView(body: Record<string, unknown>) {
    return this.http.post<LearningObjectInteractionResponse>(`${baseUrl}/object-learning/interaction/`, body);
  }

  getObjectsTeacher(page: number = 1) {
    return this.http.get<ApiPaginatedResponse<ObjectLearning>>(`${baseUrl}/learning-objects/observation/`, {
      params: { page },
    });
  }

  getMyObjectQualifications() {
    return this.http.get<ApiPaginatedResponse<ObjectLearning>>(`${baseUrl}/learning-objects/my-qualification/`);
  }

  deleteObjestTeacher(id: number) {
    return this.http.delete<ApiMessageResponse>(`${baseUrl}/learning-object-file-delete/${id}`);
  }

  deleteObjestTeacherAdmin(id: number, data: Record<string, string> | null = null) {
    const params = data?.message
      ? { ...data, message: normalizeMultilineMessage(data.message) }
      : data;

    return this.http.delete<ApiMessageResponse>(
      `${baseUrl}/learning-object-file-delete-admin/${id}`,
      {
        observe: "body",
        params,
      }
    );
  }

  notificationObjectTeacherAdmin(id: number, data: { message: string }) {
    return this.http.post<ApiMessageResponse>(
      `${baseUrl}/learning-objects-review-notification/${id}/`,
      { message: normalizeMultilineMessage(data.message) }
    );
  }

  getObjectsViewed() {
    return this.http.get<
      ViewedLearningObjectItemResponse[] | ApiPaginatedResponse<ViewedLearningObjectItemResponse>
    >(`${baseUrl}/learning-objects/viewed/`);
  }

  getObjectResultsEvaluation(id: number) {
    return this.http.get<ExpertEvaluationResultResponse[]>(
      `${baseUrl}/learning-objects/evaluations-result-to-expert/${id}/`
    );
  }

  /////////////////////////////Estudiante
  getObjectResultsEvaluationStudent(id: number) {
    return this.http.get<StudentEvaluationResultResponse[]>(
      `${baseUrl}/learning-objects/student/result-to-student/${id}/`
    );
  }

  ////////////////////////Automatico
  getObjectResultsEvaluationAutomatic(id: number) {
    return this.http.get<AutomaticEvaluationResultResponse[]>(
      `${baseUrl}/learning-objects/evaluations-result-to-expert-automatic/${id}/`
    );
  }

  /////////////////////////////Estudiante Public
  getObjectResultsPublicEvaluationStudent(id: number) {
    return this.http.get<StudentPublicEvaluationResultResponse[]>(
      `${baseUrl}/learning-objects/student/result-to-public-student/${id}/`
    );
  }

  getObjectResultsPublicEvaluationStudentSingle(id: number) {
    return this.http.get<StudentPublicEvaluationResultResponse[]>(
      `${baseUrl}/learning-objects/student/result-to-public-student-single/${id}/`
    );
  }

  getPopulars() {
    return this.http.get<ObjectLearning[]>(`${baseUrl}/learning-objects/populars/`);
  }

  /**
   * Funcion que me retorna los mas gustados
   * @method getMostPopulars
   * @returns 
   */
  public getMostPopulars() {
    return this.http.get<ObjectLearning[]>(`${baseUrl}/learning-objects/most-liked/`);
  }

  /**
   * Servicio que retorna los objetos de apredizaje mas recientes
   * @method getMostRecent
   */
  public getMostRecent(){
    return this.http.get<ObjectLearning[]>(`${baseUrl}/learning-objects-most-recent`);
  }

  searchExpertNoRated() {
    return this.http.get<ObjectLearning[]>(`${baseUrl}/learning-objects/expert-collaborator/no-rated/`);
  }

  /**
   * Envia el paquete fuente a OER-ADAP para iniciar el flujo externo de adaptacion.
   */
  set_learningObject(data: Record<string, unknown>) {
    return this.http.post<OerIntegrationResponse>(`${baseUrlOer}/api/integration/receive_file/`, data);
  }

  /**
   * Persiste en ROA la referencia de integracion devuelta por OER-ADAP.
   */
  save_Integration_With_OerAdap(data: Record<string, unknown>) {
    return this.http.post<ApiMessageResponse>(`${baseUrl}/learning-object-oer/create`, data);
  }

  /**
   * Funcion para devolver el numero de likes que tiene cada objeto de aprendizaje
   * @param idLearningObject 
   * @returns 
   */
  public get_liked_learningObject(idLearningObject:number) {
    return this.http.get<LearningObjectLikesTotalResponse[]>(`${baseUrl}/learning-objects/liked-count/${idLearningObject}`);
  }

  /**
   * Consulta que devulve los objetos de aprendizaje 
   * mejores puntuados
   * @method getLearningObjectsMostLiked
   */
  public getLearningObjectsMostLiked(){
    return this.http.get<ObjectLearning[]>(`${baseUrl}/learning-objects/most-liked/`);
  }


  /**
   * Solicita la referencia anónima usada para contabilizar interacciones.
   */
  public getReferenceUserView(){
    const data = {
      key_ref : INTERACTION_REFERENCE_BOOTSTRAP_KEY
    }
    return this.http.post<ApiReferenceResponse>(`${baseUrl}/interaction-ref/`, data);
  }

}
