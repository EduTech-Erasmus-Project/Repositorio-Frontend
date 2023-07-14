import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  constructor(private http: HttpClient) {}

  getDomainsTeacher(id_option:number) {
    return this.http.get(`${baseUrl}/settings/email-domain?type=TEACHER&option=${id_option}`);
  }

  getDomainExpert(id_option:number){
    return this.http.get(`${baseUrl}/settings/email-domain?type=EXPERT&option=${id_option}`);
  }

  getDomainStudent(id_option:number){
    return this.http.get(`${baseUrl}/settings/email-domain?type=STUDENT&option=${id_option}`);
  }

  getDomain(id: number, value) {
    return this.http.get(`${baseUrl}/settings/email-domain/${id}?type=${value}`,);
  }

 getOptionRegister(){
  return this.http.get(`${baseUrl}/settings/option-register/`);
 } 

  createDomain(data: any) {
    return this.http.post(`${baseUrl}/settings/email-domain/`, data);
  }

  updateDomain(id: number, data: any,value) {
    return this.http.put(`${baseUrl}/settings/email-domain-update/${id}?type=${value}`, data);
  }

  deleteDomain(id: number) {
    return this.http.delete(`${baseUrl}/settings/email-domain/${id}`);
  }

  getDomainsActive() {
    return this.http.get(`${baseUrl}/settings/email-domain/active`);
  }

  getOrCreateServer(){
    return this.http.get(`${baseUrl}/settings/email/`);
  }

  updateServer(data: any){
    return this.http.post(`${baseUrl}/settings/email/`, data);
  }

  testServer(data: any){
    return this.http.post(`${baseUrl}/settings/email-testing/`, data);
  }


  getTypeUserOptionRegister(){
    return this.http.get(`${baseUrl}/settings/type-user-option-register/`);
  }
  updateTypeUserOptionRegister(data: any,id: number){
    return this.http.put(`${baseUrl}/settings/type-user-option-register-update/${id}`,data);
  }
}
