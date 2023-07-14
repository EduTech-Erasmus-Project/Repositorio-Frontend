import { Component, OnInit } from "@angular/core";
import { LoginService } from "../../../services/login.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  constructor(public loginService: LoginService) {}

  ngOnInit(): void {}
}
