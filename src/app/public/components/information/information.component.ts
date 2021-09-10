import { Component, OnInit } from "@angular/core";
import { LoginService } from "../../../services/login.service";
import { Router, NavigationExtras } from "@angular/router";

@Component({
  selector: "app-information",
  templateUrl: "./information.component.html",
  styleUrls: ["./information.component.scss"],
})
export class InformationComponent implements OnInit {
  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {}

  onClickRegister(type: string) {
    let extras: NavigationExtras = {
      queryParams: {
        register: type,
      },
    };
    this.router.navigate(["register"], extras);
    //console.log("click")
  }

  onClickLogin() {
    this.router.navigate(["login"]);
  }

  get user() {
    return this.loginService.user;
  }
}
