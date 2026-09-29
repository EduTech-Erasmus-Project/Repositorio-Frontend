import { Component } from "@angular/core";
import { LoginService } from "../../../services/login.service";

@Component({
    selector: "app-baner-register",
    templateUrl: "./baner-register.component.html",
    styleUrls: ["./baner-register.component.scss"],
    standalone: false
})
export class BanerRegisterComponent {
  constructor(private loginService: LoginService) {}

  get user() {
    return this.loginService.user;
  }
}
