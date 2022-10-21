import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AdminRoutingModule } from "./admin/admin.routing";
import { QuicklinkStrategy } from "ngx-quicklink";
import { PublicRoutingModule } from "./public/public-routing.module";
import { ErrorComponent } from "./shared/error/error.component";
import { NotfoundComponent } from "./shared/notfound/notfound.component";
import { TranslateModule } from "@ngx-translate/core";

const routes: Routes = [
  { path: "error", component: ErrorComponent },
  { path: "notfound", component: NotfoundComponent },
  { path: "**", redirectTo: "notfound", pathMatch: "full" },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: QuicklinkStrategy,
      //scrollPositionRestoration: 'enabled',
      enableTracing: false,
      paramsInheritanceStrategy: "always",
    }),
    PublicRoutingModule,
    AdminRoutingModule,
    TranslateModule
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
