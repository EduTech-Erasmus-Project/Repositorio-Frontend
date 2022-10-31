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
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/home/home.module").then((m) => m.HomeModule),
        data: {
          breadcrumb: null,
        },
      },
      {
        path: "login",
        loadChildren: () =>
          import("../auth/login/login.module").then((m) => m.LoginModule),
        canActivate: [CheckLoginGuard],
      },
      {
        path: "register",
        loadChildren: () =>
          import("../auth/sign-up/sign-up.module").then((m) => m.SignUpModule),
        canActivate: [CheckLoginGuard],
      },
      {
        path: "restart-password",
        loadChildren: () =>
          import("../auth/recover-password/recover-password.module").then(
            (m) => m.RecoverPasswordModule
          ),
      },
      {
        path: "search",
        loadChildren: () =>
          import("./pages/search/search.module").then((m) => m.SearchModule),
      },
      {
        path: "terms-and-conditions",
        loadChildren: () =>
          import("./pages/terms/terms.module").then((m) => m.TermsModule),
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
      },
      {
        path: "contact",
        loadChildren: () =>
          import("./pages/contact/contact.module").then((m) => m.ContactModule),
      },
      {
        path: "recommended",
        loadChildren: () =>
          import("./pages/recommended/recommended.module").then(
            (m) => m.RecommendedModule
          ),
        canActivate: [StudentGuard],
        // data: {
        //   breadcrumb: "Recomendados",
        // },
      },
      {
        path: "about-us",
        loadChildren: () =>
          import("./pages/aboutus/aboutus.module").then((m) => m.AboutusModule),
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
      },
      {
        path: 'password-resed/:uidb64/:token',
        loadChildren: () =>
          import('../auth/password-resed/password-resed.module').then((m) => m.PasswordResedModule),
        component: PasswordResedComponent
      },
      {
        path: 'reset/:?',
        loadChildren: () =>
          import('../auth/reset/reset.module').then((m) => m.ResetModule),
      },
      {
        path: 'emailMessage',
        loadChildren: () => import
          ('../auth/emailMessage/email-message.module').then(m => m.EmailMessageModule),
      },
      {
        path: 'emailVerify/:token/:email',
        loadChildren: () => import('./pages/verify-email/verify-email.module').then(m => m.VerifyEmailModule),
      },
      {
        path: 'guide',
        loadChildren: () => import('./pages/guide/guide.module').then(m => m.GuideModule),
      },
      {
        path: 'guideTeacher',
        loadChildren: () => import('./pages/guideTeacher/guide-teacher.module').then(m => m.GuideTeacherModule),
      },
      { 
        path: 'guideStudent',
        loadChildren: () => import('./pages/guideStudent/guide-student.module').then(m => m.GuideStudentModule)
      },
      { 
        path: 'guideExpert', 
        loadChildren: () => import('./pages/guideExpert/guide-expert.module').then(m => m.GuideExpertModule) 
      },
    ],
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule { }
