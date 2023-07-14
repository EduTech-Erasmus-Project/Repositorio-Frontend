import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AccessdeniedComponent } from '../shared/accessdenied/accessdenied.component';
import { NotfoundComponent } from '../shared/notfound/notfound.component';
import { ErrorComponent } from '../shared/error/error.component';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NoimagePipe } from '../pipes/noimage.pipe';
import { AdminRoutingModule } from './admin.routing';
import { AdministratorUserListComponent } from './components/administrator-user-list/administrator-user-list.component';
import { AdministratorUserRegisterComponent } from './components/administrator-user-register/administrator-user-register.component';
import { ExpertQuestionCreateListComponent } from './components/expert-question-create-list/expert-question-create-list.component';
import { LearningObjectApprovedListComponent } from './components/learning-object-approved-list/learning-object-approved-list.component';
import { LearningObjectEvaluatedDetailComponent } from './components/learning-object-evaluated-detail/learning-object-evaluated-detail.component';
import { LearningObjectPendingListComponent } from './components/learning-object-pending-list/learning-object-pending-list.component';
import { TeacherApprovedComponent } from './components/teacher-approved/teacher-approved.component';
import { TeacherPendingComponent } from './components/teacher-pending/teacher-pending.component';
import { TeacherExpertProfileComponent } from './components/teacher-expert-profile/teacher-expert-profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LearningObjectDetailComponent } from './components/learning-object-detail/learning-object-detail.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';
import { UpperCapilPipeComponent } from './pipes/upper.capilal.pipe';
import { LearningObjectUploadListComponent } from './components/learning-object-upload-list/learning-object-upload-list.component';
import { LearningObjectEvaluatedListComponent } from './components/learning-object-evaluated-list/learning-object-evaluated-list.component';
import { LoadingComponent } from './components/loading/loading.component';
import { StudentComponent } from './components/student/student.component';
import { UrlSanitizerPipe } from './pipes/url.sanitizer.pipe';
import { StudentQuestionCreateListComponent } from './components/student-question-create-list/student-question-create-list.component';
import { MetadataQuestionCreateListComponent } from './components/metadata-question-create-list/metadata-question-create-list.component';
import { LearningObjectQualificateStudentListComponent } from './components/learning-object-qualificate-student/learning-object-qualificate-student.component';
import { ViewStudentEvaluationsAdminComponent } from './components/view-student-evaluations-admin/view-student-evaluations-admin.component';
import { ExpertPendingComponent } from './components/expert-pending/expert-pending.component';
import { ExpertApprovedComponent } from './components/expert-approved/expert-approved.component';
import { LearningObjectQualificateExpertListComponent } from './components/learning-object-qualificate-expert/learning-object-qualificate-expert.component';
import { ViewExpertEvaluationsAdminComponent } from './components/view-expert-evaluations-admin/view-expert-evaluations-admin.component';
import { ReportComponent } from './components/report/report.component';
import { MetadataQuestionListComponent } from './components/metadata-question-list/metadata-question-create-list.component';
import { CountriesListComponent } from './components/countries-list/countries-list.component';
import { CountriesFormComponent } from './components/countries-form/countries-form.component';
import { ProvincesListComponent } from './components/provinces-list/provinces-list.component';
import { ProvincesFormComponent } from './components/provinces-form/provinces-form.component';
import { CitiesListComponent } from './components/cities-list/cities-list.component';
import { CitiesFormComponent } from './components/cities-form/cities-form.component';
import { UniversityListComponent } from './components/university-list/university-list.component';
import { UniversityFormComponent } from './components/university-form/university-form.component';
import { CampusListComponent } from './components/campus-list/campus-list.component';
import { CampusFormComponent } from './components/campus-form/campus-form.component';
import { EmailDomainsListComponent } from './components/email-domains-list/email-domains-list.component';
import { EmailDomainsFormComponent } from './components/email-domains-form/email-domains-form.component';
import { EmailServerFormComponent } from './components/email-server-form/email-server-form.component';



@NgModule({
  declarations: [
    AdminComponent, 
    AccessdeniedComponent, 
    NotfoundComponent, 
    ErrorComponent, 
    NoimagePipe, 
    DashboardComponent, 
    AdministratorUserListComponent,
    AdministratorUserRegisterComponent, 
    ExpertQuestionCreateListComponent, 
    LearningObjectApprovedListComponent, 
    LearningObjectEvaluatedDetailComponent, 
    LearningObjectPendingListComponent, 
    TeacherApprovedComponent, 
    TeacherPendingComponent, 
    TeacherExpertProfileComponent, 
    LearningObjectDetailComponent, 
    AdminProfileComponent,
    UpperCapilPipeComponent,
    LearningObjectUploadListComponent,
    LearningObjectEvaluatedListComponent,
    LoadingComponent,
    StudentComponent,
    UrlSanitizerPipe,
    StudentQuestionCreateListComponent,
    MetadataQuestionCreateListComponent,
    LearningObjectQualificateStudentListComponent,
    LearningObjectQualificateExpertListComponent,
    ViewStudentEvaluationsAdminComponent,
    ExpertPendingComponent,
    ExpertApprovedComponent,
    ViewExpertEvaluationsAdminComponent,
    ReportComponent,
    MetadataQuestionListComponent,
    CountriesListComponent,
    CountriesFormComponent,
    ProvincesListComponent,
    ProvincesFormComponent,
    CitiesListComponent,
    CitiesFormComponent,
    UniversityListComponent,
    UniversityFormComponent,
    CampusListComponent,
    CampusFormComponent,
    EmailDomainsListComponent,
    EmailDomainsFormComponent,
    EmailServerFormComponent,
  ],
  exports: [
    AdminComponent, 
    AccessdeniedComponent, 
    NotfoundComponent, 
    ErrorComponent, 
    NoimagePipe, 
    DashboardComponent, 
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
