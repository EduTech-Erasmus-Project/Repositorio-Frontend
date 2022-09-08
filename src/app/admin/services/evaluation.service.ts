import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EvaluationForm } from '../../core/interfaces/evaluation';

const baseUrl = environment.baseUrl;
@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  constructor(private http: HttpClient) {

   }

   registrarConcepto(formData: EvaluationForm){
    const headers = new HttpHeaders({
      "Authorization": "Token " + localStorage.getItem("token")
    });
    return this.http.post(`${ baseUrl }/api/objeto-de-aprendizaje/concepto-evaluacion/`, formData, { headers });
  }
   obtenerConceptos(){
    const headers = new HttpHeaders({
      "Authorization": "Token " + localStorage.getItem("token")
    });
    return this.http.get(`${ baseUrl }/api/objeto-de-aprendizaje/concepto-evaluacion/`, { headers }).pipe(map((data: any) => data));
  }

  get_qualification_expert_results(){
    return this.http.get(`${ baseUrl }/learning-objects/evaluated-expert-qualification/`);
  }

  get_qualification_student_results(id:number){
    return this.http.get(`${ baseUrl }/learning-objects/evaluated-student-qualification/`+id);
  }

  getObjectResultsEvaluationStudentResult_Admin(id_user:number,id_oa:number){
    return this.http.get(`${baseUrl}/learning-objects/evaluated-student-qualification-results/${id_user}/${id_oa}`).pipe(map((data: any) => data));
    }

}
