import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { AdminComponent } from "./admin.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { AuthGuard } from "../guards/auth.guard";
import { AdminGuard } from '../guards/admin.guard';
import { TeacherPendingComponent } from "./components/teacher-pending/teacher-pending.component";
import { TeacherApprovedComponent} from "./components/teacher-approved/teacher-approved.component";
import { TeacherExpertProfileComponent } from "./components/teacher-expert-profile/teacher-expert-profile.component";
import { LearningObjectEvaluatedDetailComponent } from "./components/learning-object-evaluated-detail/learning-object-evaluated-detail.component";
import { LearningObjectApprovedListComponent } from "./components/learning-object-approved-list/learning-object-approved-list.component";
import { LearningObjectPendingListComponent } from "./components/learning-object-pending-list/learning-object-pending-list.component";
import { LearningObjectDetailComponent } from "./components/learning-object-detail/learning-object-detail.component";
import { AdminProfileComponent } from "./components/admin-profile/admin-profile.component";
import { ExpertQuestionCreateListComponent } from "./components/expert-question-create-list/expert-question-create-list.component";
import { AdministratorUserRegisterComponent } from "./components/administrator-user-register/administrator-user-register.component";
import { AdministratorUserListComponent } from "./components/administrator-user-list/administrator-user-list.component";
import { LearningObjectUploadListComponent } from "./components/learning-object-upload-list/learning-object-upload-list.component";
import { LearningObjectEvaluatedListComponent } from "./components/learning-object-evaluated-list/learning-object-evaluated-list.component";
import { StudentComponent } from "./components/student/student.component";
import { MetadataQuestionCreateListComponent } from './components/metadata-question-create-list/metadata-question-create-list.component';
import { StudentQuestionCreateListComponent } from './components/student-question-create-list/student-question-create-list.component';
import { LearningObjectQualificateListComponent } from "./components/learning-object-qualificate/learning-object-qualificate.component";
import { LearningObjectQualificateStudentListComponent } from "./components/learning-object-qualificate-student/learning-object-qualificate-student.component";
import { ExpertPendingComponent } from "./components/expert-pending/expert-pending.component";
import { ExpertApprovedComponent } from "./components/expert-approved/expert-approved.component";

const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: "",
        pathMatch: 'full',
        redirectTo: 'home',
      },
      { path: "home", component: DashboardComponent},
      { path: "learning-object/approved", component: LearningObjectApprovedListComponent },
      { path: "learning-object/pending", component: LearningObjectPendingListComponent },
      { path: "learning-object/qualified-expert", component: LearningObjectQualificateListComponent },
      { path: "learning-object/qualified-student/:id",component: LearningObjectQualificateStudentListComponent },
      { path: "learning-object/:type/detail/:slug", component: LearningObjectDetailComponent },
      { path: "teacher/request/pending", component: TeacherPendingComponent },
      { path: "teacher/request/approved", component: TeacherApprovedComponent },
      { path: "expert/request/pending", component: ExpertPendingComponent },
      { path: "expert/request/approved", component: ExpertApprovedComponent },
      { path: "teacher/request/pending/teacher-expert-profile/:id/:status", component: TeacherExpertProfileComponent },
      { path: "teacher/request/approved/teacher-expert-profile/:id/:status", component: TeacherExpertProfileComponent },
      { path: "teacher/request/approved/learning-object/evaluated/:id", component: LearningObjectEvaluatedListComponent },
      { path: "teacher/request/approved/learning-object/evaluated/:expertId/detail/:slug", component: LearningObjectEvaluatedDetailComponent },
      { path: "teacher/request/approved/learning-object/upload/detail/:slug", component: LearningObjectEvaluatedDetailComponent },
      { path: "teacher/request/approved/learning-object/upload/:id", component: LearningObjectUploadListComponent },
      { path: "profile", component: AdminProfileComponent },
      { path: "student", component: StudentComponent },
      { path: "expert/question", component: ExpertQuestionCreateListComponent },
      { path: "expert/automatic", component: MetadataQuestionCreateListComponent },
      { path: "expert/student", component: StudentQuestionCreateListComponent  },
      { path: "administrator/register", component: AdministratorUserRegisterComponent },
      { path: "administrator/list", component: AdministratorUserListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
