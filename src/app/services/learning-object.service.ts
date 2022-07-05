import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { StorageService } from "./storage.service";
import { serialize } from "object-to-formdata";

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root",
})
export class LearningObjectService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  getLearningObject() {
    return this.http
      .get(`${baseUrl}/areas-de-conocimiento/`)
      .pipe(map((data: any) => data));
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

  getObjectDetailById(id:number){
    return this.http.get(`${baseUrl}/learning-object-metadata/${id}/`);
  }

  getComments(id: number) {
    return this.http.get(`${baseUrl}/learning-objects/comments/${id}`);
  }

  addComent(formData: any) {
    //console.log("data", formData);
    return this.http.post(
      `${baseUrl}/learning-object/create/commentary/`,
      formData
    );
  }

  addMetadata(object: any) {
    let formData = serialize(object);
    return this.http.post(`${baseUrl}/learning-object-metadata/`, formData);
  }

  editMetadata(object: any) {
    let formData = serialize(object);
    return this.http.patch(`${baseUrl}/learning-object-metadata/${object.id}/`, formData);
  }

  sendQualificationExpert(data: any) {
    //let aux = new FormData();
    //console.log("ser", data);
    return this.http.post(baseUrl + "/learning-objects/register-evaluation-expert/", data);
  }

  sendQualificationExpertUpdate(data: any, id: number) {
    //let aux = new FormData();
    //console.log("ser", data);
    return this.http.put(`${baseUrl}/learning-objects/register-evaluation-expert/${id}/`, data);
  }

  ////////////////estudiante
  sendQualificationStudent(data: any) {
    return this.http.post(baseUrl + "/learning-objects/student-evaluation/", data);
  }
  sendQualificationStudentUpdate(data: any, id: number) {
    //let aux = new FormData();
    //console.log("ser", data);
    return this.http.put(`${baseUrl}/learning-objects/student-evaluation/${id}/`, data);
  }

  validateLike(id){
    //console.log("object id", id)
    return this.http.get(`${baseUrl}/learning-objects/liked/${id}`);
  }

  getRecommendedObjects(){
    return this.http.get(`${baseUrl}/learning-objects/recommended/`);
  }

  getResultsEvaluation(id){
    return this.http.get(`${baseUrl}/learning-objects/evaluations-result-expert/${id}`).pipe(map((data: any) => data));
  }

  getResultsEvaluationSingle(id){
    return this.http.get(`${baseUrl}/learning-objects/evaluations-result-expert-single/${id}`).pipe(map((data: any) => data));
  }


  interactionLike(body:any){
    //console.log("body request", body)
    return this.http.put(`${baseUrl}/object-learning/interaction/${body.id}/`, body);
  }
  // putInteractionLike(body:any){
  //   return this.http.put(`${baseUrl}/object-learning/interaction/`, body);
  // }
  interactionView(body:any){
    return this.http.post(`${baseUrl}/object-learning/interaction/`, body);
  }

  getObjectsTeacher(){
    return this.http.get(`${baseUrl}/learning-objects/observation/`);
  }

  deleteObjestTeacher(id:number){
    return this.http.delete(`${baseUrl}/learning-object-file-delete/${id}`);
  }

  getObjectsViewed(){
    return this.http.get(`${baseUrl}/learning-objects/viewed/`);
  }


  getObjectResultsEvaluation(id){
  return this.http.get(`${baseUrl}/learning-objects/evaluations-result-to-expert/${id}/`).pipe(map((data: any) => data));
  }

  /////////////////////////////Estudiante
  getObjectResultsEvaluationStudent(id){
    return this.http.get(`${baseUrl}/learning-objects/student/result-to-student/${id}/`).pipe(map((data: any) => data));
    }

  ////////////////////////Automatico
  getObjectResultsEvaluationAutomatic(id){
    return this.http.get(`${baseUrl}/learning-objects/evaluations-result-to-expert-automatic/${id}/`).pipe(map((data: any) => data));
    }

  /////////////////////////////Estudiante Public
  getObjectResultsPublicEvaluationStudent(id){
    return this.http.get(`${baseUrl}/learning-objects/student/result-to-public-student/${id}/`).pipe(map((data: any) => data));
    }

    getObjectResultsPublicEvaluationStudentSingle(id){
      return this.http.get(`${baseUrl}/learning-objects/student/result-to-public-student-single/${id}/`).pipe(map((data: any) => data));
      }

  getPopulars(){
    return this.http.get(`${ baseUrl }/learning-objects/populars/`).pipe(map((data:any) => data));
  }

  searchExpertNoRated(){
    return this.http.get(`${ baseUrl }/learning-objects/expert-collaborator/no-rated/`).pipe(map((data:any) => data));
  }
  
}

