import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AdminComponent } from "src/app/admin/admin.component";
import { LoginService } from "src/app/services/login.service";
// import { AppMainComponent } from '../../app.main.component';

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.css"],
})
export class TopbarComponen {
  activeItem: number;
  public imageUrl = "../assets/demo/images/avatar/annafali.png";

  constructor(
    public appMain: AdminComponent,
    public loginService: LoginService,
    private router: Router
  ) {}
  //   ngOnInit() {
  //     console.log('Imagen');
  //     console.log(this.auth.user.first_name);
  // }
  mobileMegaMenuItemClick(index) {
    this.appMain.megaMenuMobileClick = true;
    this.activeItem = this.activeItem === index ? null : index;
  }
  logOut() {
    //console.log('Logout')
    this.loginService.signOut();
  }
  navigateUserProfile() {
    this.router.navigateByUrl("/admin/learning-object");
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }
}
