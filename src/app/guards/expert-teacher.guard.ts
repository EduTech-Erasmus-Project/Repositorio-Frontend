import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class ExpertAndTeacherGuard implements CanActivate {

  constructor(private loginService:LoginService, private router:Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      if(this.loginService.validateRole('expert') || this.loginService.validateRole('teacher')){
        return true;
      }else{
        this.router.navigate(['home'])
        //console.log("teacher guard")
        return false
      }
  }
  
}
