import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { QuicklinkStrategy } from "ngx-quicklink";
import { AccessdeniedComponent } from "./shared/accessdenied/accessdenied.component";
import { ErrorComponent } from "./shared/error/error.component";
import { NotfoundComponent } from "./shared/notfound/notfound.component";
import { TranslateModule } from "@ngx-translate/core";

/**
 * Rutas raiz del frontend.
 *
 * Delegan el shell publico y el panel administrativo a sus modulos lazy, y
 * reservan aqui solo las pantallas globales de error o acceso denegado.
 */
const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./public/public.module").then((m) => m.PublicModule),
  },
  {
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
  },
  { path: "accessdenied", component: AccessdeniedComponent },
  { path: "access-denied", redirectTo: "accessdenied", pathMatch: "full" },
  { path: "error", component: ErrorComponent },
  { path: "notfound", component: NotfoundComponent },
  { path: "**", redirectTo: "notfound", pathMatch: "full" },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: QuicklinkStrategy,
      enableTracing: false,
      paramsInheritanceStrategy: "always",
    }),
    TranslateModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
