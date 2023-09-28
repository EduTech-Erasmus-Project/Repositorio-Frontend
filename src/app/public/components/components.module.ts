import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { SearchComponent } from './search/search.component';
import { InformationComponent } from './information/information.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BanerRegisterComponent } from './baner-register/baner-register.component';
import { CardComponent } from './card/card.component';
import { SidebarSearchComponent } from './sidebar-search/sidebar-search.component';
import { WebViewComponent } from './web-view/web-view.component';
import { CommentsComponent } from './comments/comments.component';
import { SideObjectComponent } from './side-object/side-object.component';
import { ViewQuestionsExpertComponent } from './view-questionsExpert/view-questions-expert.component';
import { ViewQuestionsComponent } from './view-questions/view-questions.component';
import { EvaluationsExpertComponent } from './evaluations-expert/evaluations-expert.component';
import { ViewEvaluacionsComponent } from './view-evaluacions/view-evaluacions.component';
import { ContributorsComponent } from './contributors/contributors.component';
import { EvaluationChartComponent } from './evaluation-chart/evaluation-chart.component';
import { ViewQuestionsStudentComponent } from './view-questions-student/view-questions-student.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownMenuLearningObjectComponent } from './drop-down-menu-learning-object/drop-down-menu-learning-object.component';

@NgModule({
  declarations: [
    SearchComponent, 
    InformationComponent, 
    BanerRegisterComponent,
    CardComponent,
    SidebarSearchComponent,
    WebViewComponent,
    CommentsComponent,
    SideObjectComponent,
    ViewQuestionsExpertComponent,
    ViewQuestionsComponent,
    EvaluationsExpertComponent,
    ViewEvaluacionsComponent,
    ContributorsComponent,
    EvaluationChartComponent,
    ViewQuestionsStudentComponent,
    
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    TranslateModule,
    DropDownMenuLearningObjectComponent
  ],
  exports:[
    SearchComponent,
    InformationComponent,
    BanerRegisterComponent,
    CardComponent,
    SidebarSearchComponent,
    WebViewComponent,
    CommentsComponent,
    SideObjectComponent,
    ViewQuestionsExpertComponent,
    ViewQuestionsComponent,
    EvaluationsExpertComponent,
    ViewEvaluacionsComponent,
    ContributorsComponent,
  ]
})
export class ComponentsModule { }
