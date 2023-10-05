import { HttpClient } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { StorageService } from "./storage.service";
import { serialize } from "object-to-formdata";
import { Observable } from "rxjs";
import { AnswerAnswerEvaluationResponse } from "../core/interfaces/QuestionEvaluation";
import { ObjectLearning } from "../core/interfaces/ObjectLearning";

const baseUrl = environment.baseUrl;
const baseUrlOer = environment.oerUrl;
@Injectable({
  providedIn: "root",
})
export class LearningObjectService {
  public interactionSideObjectSelect = new EventEmitter<ObjectLearning>;
  constructor(private http: HttpClient) {}

  getLearningObject() {
    return this.http
      .get(`${baseUrl}/areas-de-conocimiento/`)
      .pipe(map((data: any) => data));
  }

  public getReferenceUserView(){
    const data = {
      key_ref : environment.key_ref
    }
    return this.http.post(`${baseUrl}/interaction-ref/`, data);
  }

  uploadObject(file: File) {
    let formData = new FormData();
    formData.append("file", file);
    return this.http.post(`${baseUrl}/learning-object-file/`, formData);
  }

  get urlUpload() {
    return `${baseUrl}/learning-object-file/`;
  }

  getObjectDetail(slug: string) {
    return this.http.get(`${baseUrl}/learning-object/${slug}`);
  }

  getObjectDetailById(id: number) {
    return this.http.get(`${baseUrl}/learning-object-metadata/${id}/`);
  }

  getComments(id: number) {
    return this.http.get(`${baseUrl}/learning-objects/comments/${id}`);
  }

  addComent(formData: any) {
    return this.http.post(
      `${baseUrl}/learning-object/create/commentary/`,
      formData
    );
  }

  addQuestionQualificationLearningObject(data :AnswerAnswerEvaluationResponse){
    return this.http.post(`${baseUrl}/learning-objects/add-metadata-self-question`,data);
  }

  addMetadata(object: any) {
    let formData = serialize(object);
    return this.http.post(`${baseUrl}/learning-object-metadata/`, formData);
  }

  editMetadata(object: any) {
    let formData = serialize(object);
    return this.http.patch(
      `${baseUrl}/learning-object-metadata/${object.id}/`,
      formData
    );
  }

  sendQualificationExpert(data: any) {
    //let aux = new FormData();
    //console.log("ser", data);
    return this.http.post(
      baseUrl + "/learning-objects/register-evaluation-expert/",
      data
    );
  }

  sendQualificationExpertUpdate(data: any, id: number) {
    //let aux = new FormData();
    //console.log("ser", data);
    return this.http.put(
      `${baseUrl}/learning-objects/register-evaluation-expert/${id}/`,
      data
    );
  }

  ////////////////estudiante
  sendQualificationStudent(data: any) {
    return this.http.post(
      baseUrl + "/learning-objects/student-evaluation/",
      data
    );
  }
  sendQualificationStudentUpdate(data: any, id: number) {
    //let aux = new FormData();
    //console.log("ser", data);
    return this.http.put(
      `${baseUrl}/learning-objects/student-evaluation/${id}/`,
      data
    );
  }

  validateLike(id) {
    //console.log("object id", id)
    return this.http.get(`${baseUrl}/learning-objects/liked/${id}`);
  }

  downloadCreateCount(data){
    return this.http.post(`${baseUrl}/learning-objects/downloaded`, data);
  }

  downloadUpdateCount(data, learningObjectId){
    return this.http.put(`${baseUrl}/learning-objects/downloaded/${learningObjectId}`, data);
  }

  getdownloadCount(learningObjectId){
    return this.http.get(`${baseUrl}/learning-objects/downloaded/${learningObjectId}`);
  }


 viewedCreateCount(data){
    return this.http.post(`${baseUrl}/learning-objects/viewed`, data);
  }

  viewedUpdateCount(data, learningObjectId){
    return this.http.put(`${baseUrl}/learning-objects/viewed/${learningObjectId}`, data);
  }

  getViewedCount(learningObjectId){
    return this.http.get(`${baseUrl}/learning-objects/viewed/${learningObjectId}`);
  }


  getRecommendedObjects() {
    return this.http.get(`${baseUrl}/learning-objects/recommended/`);
  }

  getResultsEvaluation(id) {
    return this.http
      .get(`${baseUrl}/learning-objects/evaluations-result-expert/${id}`)
      .pipe(map((data: any) => data));
  }

  getResultsEvaluationPriority(id) {
    return this.http
      .get(
        `${baseUrl}/learning-objects/evaluations-result-expert-priority/${id}`
      )
      .pipe(map((data: any) => data));
  }

  getResultsEvaluationSingle(id) {
    return this.http
      .get(`${baseUrl}/learning-objects/evaluations-result-expert-single/${id}`)
      .pipe(map((data: any) => data));
  }

  interactionLike(body: any) {
    //console.log("body request", body)
    return this.http.put(
      `${baseUrl}/object-learning/interaction/${body.id}/`,
      body
    );
  }
  // putInteractionLike(body:any){
  //   return this.http.put(`${baseUrl}/object-learning/interaction/`, body);
  // }
  interactionView(body: any) {
    return this.http.post(`${baseUrl}/object-learning/interaction/`, body);
  }

  getObjectsTeacher() {
    return this.http.get(`${baseUrl}/learning-objects/observation/`);
  }

  getMyObjectQualifications() {
    return this.http.get(`${baseUrl}/learning-objects/my-qualification/`);
  }

  deleteObjestTeacher(id: number) {
    return this.http.delete(`${baseUrl}/learning-object-file-delete/${id}`);
  }

  deleteObjestTeacherAdmin(id: number, data: any = null) {
    return this.http.delete(
      `${baseUrl}/learning-object-file-delete-admin/${id}`,
      {
        observe: "body",
        params: data,
      }
    );
  }

  getObjectsViewed() {
    return this.http.get(`${baseUrl}/learning-objects/viewed/`);
  }

  getObjectResultsEvaluation(id) {
    return this.http
      .get(`${baseUrl}/learning-objects/evaluations-result-to-expert/${id}/`)
      .pipe(map((data: any) => data));
  }

  /////////////////////////////Estudiante
  getObjectResultsEvaluationStudent(id) {
    return this.http
      .get(`${baseUrl}/learning-objects/student/result-to-student/${id}/`)
      .pipe(map((data: any) => data));
  }

  ////////////////////////Automatico
  getObjectResultsEvaluationAutomatic(id) {
    return this.http
      .get(
        `${baseUrl}/learning-objects/evaluations-result-to-expert-automatic/${id}/`
      )
      .pipe(map((data: any) => data));
  }

  /////////////////////////////Estudiante Public
  getObjectResultsPublicEvaluationStudent(id) {
    return this.http
      .get(
        `${baseUrl}/learning-objects/student/result-to-public-student/${id}/`
      )
      .pipe(map((data: any) => data));
  }

  getObjectResultsPublicEvaluationStudentSingle(id) {
    return this.http
      .get(
        `${baseUrl}/learning-objects/student/result-to-public-student-single/${id}/`
      )
      .pipe(map((data: any) => data));
  }

  getPopulars() {
    return this.http
      .get(`${baseUrl}/learning-objects/populars/`)
      .pipe(map((data: any) => data));
  }

  /**
   * Funcion que me retorna los mas gustados
   * @method getMostPopulars
   * @returns 
   */
  public getMostPopulars() {
    return this.http.get(`${baseUrl}/learning-objects/most-liked/`);
  }

  /**
   * Servicio que retorna los objetos de apredizaje mas recientes
   * @method getMostRecent
   */
  public getMostRecent(){
    return this.http.get(`${baseUrl}/learning-objects-most-recent`);
  }

  searchExpertNoRated() {
    return this.http
      .get(`${baseUrl}/learning-objects/expert-collaborator/no-rated/`)
      .pipe(map((data: any) => data));
  }

  set_learningObject(data: any) {
    return this.http.post(`${baseUrlOer}/api/integration/receive_file/`, data);
  }

  save_Integration_With_OerAdap(data: any) {
    return this.http.post(`${baseUrl}/learning-object-oer/create`, data);
  }

  /**
   * Funcion para devolver el numero de likes que tiene cada objeto de aprendizaje
   * @param idLearningObject 
   * @returns 
   */
  public get_liked_learningObject(idLearningObject:number) {
    return this.http.get(`${baseUrl}/learning-objects/liked-count/${idLearningObject}`);
  }

  /**
   * Consulta que devulve los objetos de aprendizaje 
   * mejores puntuados
   * @method getLearningObjectsMostLiked
   */
  public getLearningObjectsMostLiked(){
    return this.http.get(`${baseUrl}/learning-objects/most-liked/`);
  }

}
