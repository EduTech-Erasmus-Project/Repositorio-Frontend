import { Component, OnInit } from "@angular/core";
import { PrimeNG } from "primeng/config";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    standalone: false
})
export class AppComponent implements OnInit {
  horizontalMenu: boolean;
  darkMode = false;
  menuColorMode = "light";
  menuColor = "layout-menu-light";
  themeColor = "blue";
  layoutColor = "blue";
  ripple = true;

  inputStyle = "outlined";



  constructor(private primengConfig: PrimeNG,

   ) {
      
    }

  ngOnInit() {
    this.primengConfig.ripple.set(true);
  }

}
