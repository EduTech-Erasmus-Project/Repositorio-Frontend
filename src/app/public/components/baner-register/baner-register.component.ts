import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-baner-register',
  templateUrl: './baner-register.component.html',
  styleUrls: ['./baner-register.component.scss']
})
export class BanerRegisterComponent implements OnInit {

  constructor(private loginService:LoginService) { }

  ngOnInit(): void {
  }

  get user(){
    return this.loginService.user;
  }

}
