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
import { LearningObjectQualificateExpertListComponent } from "./components/learning-object-qualificate-expert/learning-object-qualificate-expert.component";
import { LearningObjectQualificateStudentListComponent } from "./components/learning-object-qualificate-student/learning-object-qualificate-student.component";
import { ExpertPendingComponent } from "./components/expert-pending/expert-pending.component";
import { ExpertApprovedComponent } from "./components/expert-approved/expert-approved.component";
import { ReportComponent } from "./components/report/report.component";
import { MetadataQuestionListComponent } from "./components/metadata-question-list/metadata-question-create-list.component";
import { CountriesListComponent } from "./components/countries-list/countries-list.component";
import { CountriesFormComponent } from "./components/countries-form/countries-form.component";
import { ProvincesListComponent } from "./components/provinces-list/provinces-list.component";
import { ProvincesFormComponent } from "./components/provinces-form/provinces-form.component";
import { CitiesListComponent } from "./components/cities-list/cities-list.component";
import { CitiesFormComponent } from "./components/cities-form/cities-form.component";
import { UniversityListComponent } from "./components/university-list/university-list.component";
import { UniversityFormComponent } from "./components/university-form/university-form.component";
import { CampusListComponent } from "./components/campus-list/campus-list.component";
import { CampusFormComponent } from "./components/campus-form/campus-form.component";
import { EmailDomainsListComponent } from "./components/email-domains-list/email-domains-list.component";
import { EmailDomainsFormComponent } from "./components/email-domains-form/email-domains-form.component";
import { EmailServerFormComponent } from "./components/email-server-form/email-server-form.component";

const routes: Routes = [
  {
    path: "",
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
      { path: "learning-object/qualified-expert/:id", component: LearningObjectQualificateExpertListComponent },
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
      { path: "expert/automatic-question", component: MetadataQuestionListComponent },
      { path: "expert/student", component: StudentQuestionCreateListComponent  },
      { path: "administrator/register", component: AdministratorUserRegisterComponent },
      { path: "administrator/list", component: AdministratorUserListComponent },
      { path: "report", component: ReportComponent },
      { path: "config/country", component: CountriesListComponent },
      { path: "config/country/:id", component: CountriesFormComponent },
      { path: "config/province", component: ProvincesListComponent },
      { path: "config/province/:id", component: ProvincesFormComponent },
      { path: "config/city", component: CitiesListComponent },
      { path: "config/city/:id", component: CitiesFormComponent },
      { path: "config/university", component: UniversityListComponent },
      { path: "config/university/:id", component: UniversityFormComponent },
      { path: "config/campus", component: CampusListComponent },
      { path: "config/campus/:id", component: CampusFormComponent },
      { path: "config/domain", component: EmailDomainsListComponent },
      { path: "config/domain/:id", component: EmailDomainsFormComponent },
      { path: "config/server", component: EmailServerFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
