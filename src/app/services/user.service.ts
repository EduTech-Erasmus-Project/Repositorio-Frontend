import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { UserGeneral } from '../core/models/userGeneral';
const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserDetail(id:number){
    return this.http.get(`${ baseUrl }/user-management/${id}`);
  }

  updateUser(user:UserGeneral){
    return this.http.put(`${ baseUrl }/user-management/${user.id}/`, user);
  }

  updateImage(file:File, userId:number){
    let formData = new FormData();
    formData.append("image", file);

    return this.http.put(`${baseUrl}/user/photo/${userId}/`, formData);
  }

  sent_email_token_verify(token: string){
    return this.http.get(`${baseUrl}/email-verify/`+token);
  }

  set_email_verify_new_token(email: string){
    let object = { 'email': email };
    return this.http.post(`${baseUrl}/set-verify/`,object);
  }
}
