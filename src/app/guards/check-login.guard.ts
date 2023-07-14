import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class CheckLoginGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router){}
  
  async canActivate(){
    let promiseLoged = await this.loginService
      .isLoged()
      .then(res => {
        this.router.navigateByUrl('/');
        return false;
      })
      .catch(err => {
        return true;
      });
    return promiseLoged as boolean;
  }
  
}
