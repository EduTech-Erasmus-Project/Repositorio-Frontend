import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SettingsComponent } from "./settings.component";
import { TeacherGuard } from "../../../guards/teacher.guard";
import { StudentGuard } from "../../../guards/student.guard";
import { ExpertGuard } from "src/app/guards/expert.guard";
import { ExpertAndStudentGuard } from "src/app/guards/expert-student.guard";

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
    data: {
      breadcrumb: null
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "profile",

      },
      {
        path: "profile",
        loadChildren: () =>
          import("./pages/profile/profile.module").then((m) => m.ProfileModule),
          data: {
            breadcrumb: "Perfil"
          },
      },
      {
        path: "security",
        loadChildren: () =>
          import("./pages/security/security.module").then(
            (m) => m.SecurityModule
          ),
          data: {
            breadcrumb: "Seguridad"
          },
      },
      {
        path: "new-object",
        loadChildren: () =>
          import("./pages/loadOa/load-oa.module").then((m) => m.LoadOaModule),
        canActivate: [TeacherGuard],
        data: {
          breadcrumb: "Nuevo objeto de aprendizaje"
        },
      },
      {
        path: "my-objects",
        loadChildren: () =>
          import("./pages/myObjects/my-objects.module").then(
            (m) => m.MyObjectsModule
          ),
        canActivate: [TeacherGuard],
        data: {
          breadcrumb: "Objetos de aprendizaje sibidos por mi"
        },
      },
      {
        path: "objects-qualified",
        loadChildren: () =>
          import("./pages/my-qualified-oa/my-qualified-oa.module").then(
            (m) => m.MyQualifiedOaModule
          ),
        canActivate: [ExpertAndStudentGuard],
        data: {
          breadcrumb: "Objetos de aprendizaje calificados por mi"
        },
      },
      {
        path: "my-views",
        loadChildren: () =>
          import("./pages/studenViewed/student-viewed.module").then(
            (m) => m.StudentViewedModule
          ),
        canActivate: [StudentGuard],
        data: {
          breadcrumb: "Objetos de aprendizaje vistos por mi"
        },
      },
      {
        path: "edit-object",
        loadChildren: () =>
          import("./pages/editObject/edit-object.module").then(
            (m) => m.EditObjectModule
          ),
        canActivate: [TeacherGuard],
        data: {
          breadcrumb: "Editar objeto de aprendizaje"
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
