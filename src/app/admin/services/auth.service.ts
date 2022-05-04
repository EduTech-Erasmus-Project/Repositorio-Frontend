import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginForm } from '../../core/interfaces/LoginForm';
import { UserModel } from '../../core/models/user.dodel';
import { serialize } from "object-to-formdata";
import { UserGeneral } from '../../core/models/userGeneral';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userToken: string;
  userId: number=0;
  public user: UserModel;

  constructor(private http: HttpClient, private router: Router) { 
    this.readToken();
  }
  login(formData: LoginForm){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const url = baseUrl + '/api/login/';
    return this.http.post(url, formData, {headers})
            .pipe(
              tap((resp: any) =>{
                this.userId=resp.id;
                localStorage.setItem('token', resp.token)
              })
            )
  }

  logOut() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
  getUserDataLogin(token: string,userId:number){
    const headers = new HttpHeaders({
      "Authorization": "Token " + token
    });
    return this.http.get(`${ baseUrl }/api/usuario-administrador/${userId}`,{ headers })
    .pipe(
      tap((resp:any) =>{
        this.user = new UserModel(resp.first_name,resp.last_name,resp.email,'','','','','',resp.image,'');
        //console.log(this.user);
      })
    )
  }

  getUserId(): number {
    return this.userId
  }

  readToken(){
    if(localStorage.getItem('token')){
      this.userToken = localStorage.getItem('token')
    }else{
      this.userToken = '';
    }
    return this.userToken;
  }
  isUserAuthenticated(): boolean{
    return this.userToken.length >2;
  }

  registerUser(data:UserGeneral){
    //let formData = serialize(data);
    console.log(data);
    return this.http.post(`${baseUrl}/user-management/`, data);
  }
}
