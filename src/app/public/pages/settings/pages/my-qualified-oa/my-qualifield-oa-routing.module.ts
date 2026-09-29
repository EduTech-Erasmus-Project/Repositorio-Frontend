import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MyQualifiedOaComponent } from "./my-qualified-oa.component";

const routes: Routes = [
  {
    path: "",
    component: MyQualifiedOaComponent,
    data: {
      breadcrumb: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyQualifieldOaRoutingModule {}
