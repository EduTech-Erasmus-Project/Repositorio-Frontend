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
}
