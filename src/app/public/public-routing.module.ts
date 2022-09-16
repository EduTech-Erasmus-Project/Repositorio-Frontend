import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PublicComponent } from "./public.component";
import { AuthGuard } from "../guards/auth.guard";
import { CheckLoginGuard } from "../guards/check-login.guard";
import { StudentGuard } from "../guards/student.guard";
import { PasswordResedComponent } from "../auth/password-resed/password-resed.component";
import { ExpertAndStudentGuardAndTeacher } from "../guards/expert-student-teacher.guard";

const routes: Routes = [
  {
    path: "",
    component: PublicComponent,
    data: {
      breadcrumb: "Inicio",
    },
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/home/home.module").then((m) => m.HomeModule),
        data: {
          breadcrumb: null,
        },
      },
      // {
      //   path: "/home",
      //   loadChildren: () =>
      //     import("./pages/home/home.module").then((m) => m.HomeModule),
      // },
      {
        path: "login",
        loadChildren: () =>
          import("../auth/login/login.module").then((m) => m.LoginModule),
        canActivate: [CheckLoginGuard],
        data: {
          breadcrumb: "Inicio de sesión",
        },
      },
      {
        path: "register",
        loadChildren: () =>
          import("../auth/sign-up/sign-up.module").then((m) => m.SignUpModule),
        canActivate: [CheckLoginGuard],
        data: {
          breadcrumb: "Registro",
        },
      },
      {
        path: "restart-password",
        loadChildren: () =>
          import("../auth/recover-password/recover-password.module").then(
            (m) => m.RecoverPasswordModule
          ),
        data: {
          breadcrumb: "Reestablecer contraseña",
        },
      },
      {
        path: "search",
        loadChildren: () =>
          import("./pages/search/search.module").then((m) => m.SearchModule),
        data: {
          breadcrumb: "Buscar",
        },

      },
      {
        path: "terms-and-conditions",
        loadChildren: () =>
          import("./pages/terms/terms.module").then((m) => m.TermsModule),
        data: {
          breadcrumb: "Términos y condiciones",
        },
      },
      {
        path: "settings",
        loadChildren: () =>
          import("./pages/settings/settings.module").then(
            (m) => m.SettingsModule
          ),
        data: {
          breadcrumb: "Configuraciones",
        },
        canActivate: [AuthGuard],
      },
      {
        path: "object",
        loadChildren: () =>
          import("./pages/object/object.module").then((m) => m.ObjectModule),
        data: {
          breadcrumb: "Objeto de aprendizaje",
        },
      },
      {
        path: "services",
        loadChildren: () =>
          import("./pages/services/services.module").then(
            (m) => m.ServicesModule
          ),
        data: {
          breadcrumb: "Servicios",
        },
      },
      {
        path: "contact",
        loadChildren: () =>
          import("./pages/contact/contact.module").then((m) => m.ContactModule),
        data: {
          breadcrumb: "Contacto",
        },
      },
      {
        path: "recommended",
        loadChildren: () =>
          import("./pages/recommended/recommended.module").then(
            (m) => m.RecommendedModule
          ),
        canActivate: [StudentGuard],
        data: {
          breadcrumb: "Recomendados",
        },
      },
      {
        path: "about-us",
        loadChildren: () =>
          import("./pages/aboutus/aboutus.module").then((m) => m.AboutusModule),
        data: {
          breadcrumb: "Acerca de nosotros",
        },
      },
      {
        path: 'report',
        loadChildren: () =>
          import('./pages/reports/reports.module').then(m => m.ReportsModule),
        canActivate: [ExpertAndStudentGuardAndTeacher],
        data: {
          breadcrumb: "Reporte Objeto de Aprendizaje",
        },
      },
      {
        path: 'developers',
        loadChildren: () =>
          import('./pages/developers/developers.module').then((m) => m.DevelopersModule),
        data: {
          breadcrumb: "Acerca de los desarrolladores",
        },
      },
      {
        path: 'password-resed/:uidb64/:token',
        loadChildren: () =>
          import('../auth/password-resed/password-resed.module').then((m) => m.PasswordResedModule),
        data: {
          breadcrumb: "Reestablecer contraseña",
        },
        component: PasswordResedComponent
      },
      {
        path: 'reset/:?',
        loadChildren: () =>
          import('../auth/reset/reset.module').then((m) => m.ResetModule),
        data: {
          breadcrumb: "Contraseña reestablecida",
        },
      },
      {
        path: 'emailMessage',
        loadChildren: () => import
          ('../auth/emailMessage/email-message.module').then(m => m.EmailMessageModule),
        data: {
          breadcrumb: "Enlace enviado",
        },
      },
      {
        path: 'emailVerify/:token/:email',
        loadChildren: () => import('./pages/verify-email/verify-email.module').then(m => m.VerifyEmailModule),
        data: {
          breadcrumb: "Verificacion de correo",
        },
      },

    ],
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule { }
