import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { map } from 'rxjs/operators';
import { UserGeneral } from '../core/models/userGeneral';
import { Observable } from 'rxjs';
const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  countUsers(){
    return this.http.get(`${ baseUrl }/user-count/`).pipe(map((data: any) => data));
  }
 
  countObjectLearning(){
    return this.http.get(`${ baseUrl }/total-oa-approved/`).pipe(map((data: any) => data));
  }

  getInterestAreas(){
    return this.http.get(`${ baseUrl }/knowledge-area/`).pipe(map((data: any) => data));
  }

  getPreferences(){
    return this.http.get(`${ baseUrl }/user-preferences/`).pipe(map((data: any) => data));
  }

  getLevelEducation(){
    return this.http.get(`${ baseUrl }/education-level/`).pipe(map((data: any) => data));
  }
  search(queryParams:any){
    return this.http.get(`${ baseUrl }/learning-objects/search/`, {params: queryParams});
  }

  searchExpert(queryParams:any){
    return this.http.get(`${ baseUrl }/learning-objects/search/expert/`, {params: queryParams});
  }

  //user function 
  getProfession(){
    return this.http.get(`${ baseUrl }/profession/`).pipe(map((data: any) => data));
  }
  
  //getPeferencesAreas
  getPreferencesArea(){
    return this.http.get(`${ baseUrl }/preferences-area/`).pipe(map((data: any) => data));
  }


  geQuestionsStudent(){
    return this.http.get(`${ baseUrl }/learning-objects-questions/student/`).pipe(map((data:any) => data));
  }

  getCreatedYear(){
    return this.http.get(`${ baseUrl }/learning-objects/years/`);
  }

  getLicenses(){
    return this.http.get(`${ baseUrl }/license/`);
  }
  
  geQuestionsExpert(){
    return this.http.get(`${ baseUrl }/learning-objects-questions/expert/`).pipe(map((data:any) => data));
  }

  getTokenRestPassword(uidb64:string, token:string){
    return this.http.get(`${ baseUrl }/password-resed/${uidb64}/${token}/`).pipe(map((data:any) => data));
  }

  getgetFilterArea(){
    return this.http.get(`${ baseUrl }/learning-object/filters/area`);
  }
  getObjectResultsEvaluationStudent(id){
    return this.http.get(`${baseUrl}/learning-objects/student/result-to-student/${id}/`).pipe(map((data: any) => data));
    }
}
