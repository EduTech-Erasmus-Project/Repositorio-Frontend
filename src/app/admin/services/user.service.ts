import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RegisterForm } from '../../core/interfaces/user-register.interface';
import { AuthService } from './auth.service';

const baseUrl = environment.baseUrl;
@Injectable({
  providedIn: 'root'
})
export class UserService {

  userToken: string;

  constructor(private http: HttpClient, private auth: AuthService) { 
  }

  register(formData: RegisterForm,){
    const headers = new HttpHeaders({
      "Authorization": "Token " + localStorage.getItem("token")
    });
    return this.http.post(`${ baseUrl }/api/usuario-administrador/`, formData, { headers })
  }
  getUserAdminList(){
    const headers = new HttpHeaders({
      "Authorization": "Token " +localStorage.getItem("token")
    });
    return this.http.get(`${ baseUrl }/api/usuario-administrador/`,{ headers }).pipe(map((data: any) => data));
  }
  listAdministratorUser(){
    return this.http.get(`${ baseUrl }/management-superuser/`).pipe(map((data: any) => data));
  }

  getReportUsers(params:any){
    return this.http.get(`${ baseUrl }/report`,{ params });

  }
}
