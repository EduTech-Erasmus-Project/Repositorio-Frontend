import { Component, OnInit } from "@angular/core";
import { LoginService } from "../../../services/login.service";
import { Router, NavigationExtras } from "@angular/router";

/**
 * Presenta accesos rapidos de onboarding publico hacia login o registro por perfil.
 */
@Component({
    selector: "app-information",
    templateUrl: "./information.component.html",
    styleUrls: ["./information.component.scss"],
    standalone: false
})
export class InformationComponent implements OnInit {
  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {}

  onClickRegister(type: string) {
    const extras: NavigationExtras = {
      queryParams: {
        register: type,
      },
    };
    this.router.navigate(["register"], extras);
  }

  onClickLogin() {
    this.router.navigate(["login"]);
  }

  get user() {
    return this.loginService.user;
  }
}
