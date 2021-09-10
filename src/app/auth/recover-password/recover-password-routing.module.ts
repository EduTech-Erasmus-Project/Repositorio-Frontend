import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RecoverPasswordComponent } from "./recover-password.component";

const routes: Routes = [
  {
    path: "",
    component: RecoverPasswordComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecoverPasswordRoutingModule {}
