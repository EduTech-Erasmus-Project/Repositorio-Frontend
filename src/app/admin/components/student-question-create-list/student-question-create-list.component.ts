import { Component, OnInit, ViewChild} from '@angular/core';
import { ConfirmationService, MessageService } from "primeng/api";
import {
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { Table } from "primeng/table";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import {
  Principle,
  Guideline,
  QuestionStudent,
  QuestionStudentUpdate,
  GuidelineUpdate,
} from "../../models/evaluation.models";

@Component({
  selector: 'app-student-question-create-list',
  templateUrl: './student-question-create-list.component.html',
  styleUrls: ['./student-question-create-list.component.scss'],
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }

      @media screen and (max-width: 960px) {
        :host
          ::ng-deep
          .p-datatable.p-datatable-customers
          .p-datatable-tbody
          > tr
          > td:last-child {
          text-align: center;
        }

        :host
          ::ng-deep
          .p-datatable.p-datatable-customers
          .p-datatable-tbody
          > tr
          > td:nth-child(6) {
          display: flex;
        }
      }
    `,
  ],
  providers: [MessageService, ConfirmationService],
})
export class StudentQuestionCreateListComponent implements OnInit {
  principleList: Principle[];
  principle: Principle = new Principle();
  principleSelect: Principle = new Principle();
  idSelectedPrinciple: number; 

  //guidelineList: Guideline[];
  //guideline: Guideline = new Guideline();
  //guidelineSelect: GuidelineUpdate = new GuidelineUpdate();
  //idSelectedGuideline: number;

  guidelineList: Guideline[];
  guidelineSelect: GuidelineUpdate = new GuidelineUpdate();
  guideline: Guideline = new Guideline();

  //principleSelect: Principle = new Principle();
  idGuidelinePrinciple: number; 
  
  questionList: QuestionStudent[];
  questionSelect: QuestionStudentUpdate = new QuestionStudentUpdate();
  question: QuestionStudent = new QuestionStudent();
 

  public formSubmit = false;
  @ViewChild("dt") table: Table;

  public registerForm = this.fb.group({
    concept: [null, Validators.required],
  });

  guidelineDialog: boolean;
  updateGuidelineDialog: boolean;
  editPrincipleDialog: boolean;
  createPrincipleDialog: boolean;

  questionDialog: boolean;
  updateQuestionDialog: boolean;
  
  submitted: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: UntypedFormBuilder,
    public appMain: AdminComponent,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private administratorServices: AdministratorService
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Preguntas de evaluación para el estudiante",
        routerLink: ["/admin/expert/student"],
      },
    ]);
  }

  ngOnInit(): void {
    this.getEvaluationStudent()
  }
  getEvaluationStudent() {
    this.administratorServices
      .getEvaluationStudent()
      .subscribe((result: any) => {
        this.principleList = result;
      });
  }
  openNew() {
    this.principle = {};
    this.submitted = false;
    this.createPrincipleDialog = true;
  }
  deleteEvaluationStudent(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorServices
          .deleteEvaluationStudent(id)
          .subscribe((result: any) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Eliminado correctamente",
            });
            setTimeout(() => {
              this.getEvaluationStudent()
            }, 900);
          });
      },
    });
  }

  confirm2(event: Event) {
    this.confirmationService.confirm({
      key: "confirm2",
      target: event.target,
      message: "Are you sure that you want to proceed?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.messageService.add({
          severity: "info",
          summary: "Confirmed",
          detail: "You have accepted",
        });
      },
      reject: () => {
        this.messageService.add({
          severity: "error",
          summary: "Rejected",
          detail: "You have rejected",
        });
      },
    });
  }

  hideDialogUpdate() {
    this.editPrincipleDialog = false;
    this.submitted = false;
  }
  hideDialogUpdateGuideline() {
    this.updateGuidelineDialog = false;
    this.updateQuestionDialog = false;
    this.submitted = false;
  }
  /////del acutalizar pregunta
  hideDialogUpdateQuestion() {
    this.updateQuestionDialog = false;
    this.submitted = false;
  }
  //////////////////
  hideDialog() {
    this.guidelineDialog = false;
    this.questionDialog = false;
    this.submitted = false;
  }
  //////////de la question
  hideDialogquestion() {
    this.questionDialog = false;
    this.submitted = false;
  }
  /////////
  hideDialogPrinciple() {
    this.createPrincipleDialog = false;
    this.submitted = false;
  }
  openEditPrincipleDialog(principle: Principle) {
    this.principleSelect = principle;
    this.submitted = false;
    this.editPrincipleDialog = true;
  }
  openEditGuidelineDialog(guideline: Guideline) {
    this.guidelineSelect = guideline;
    this.submitted = false;
    this.updateGuidelineDialog = true;
  }
  ////////////////////////////editar pregunta
  openEditquestionGuidelineDialog(question: QuestionStudent) {
   
    this.questionSelect = question;
    this.submitted = false;
    this.updateQuestionDialog = true;
  }
  ///////////////////////////
  updatePrinciple() {
    this.submitted = true;
    this.administratorServices
      .putEvaluationStudent(this.principleSelect)
      .subscribe((data) => {
        this.editPrincipleDialog = false;
      });
  }
  openGuideline(principle: Principle) {
    this.principleSelect =principle;
    this.submitted = false;
    this.guidelineDialog = true;
  }
  /////////////////nueva pregunta para un guideline
  openQuestion(guideline: Guideline) {
    this.guidelineSelect =guideline;
    this.submitted = false;
    this.questionDialog = true;
  }

  saveQuestion() {
    this.question.guideline = this.guidelineSelect.id;
   
    this.administratorServices.postQuestionStudent(this.question).subscribe(
      (result) => {
        this.question = new QuestionStudent();
      
        this.retrieveEvaluationData2(this.guidelineSelect.id);
      },
      (err: any) => {
       
      }
    );
  }

  /////////////////
  saveGuideline() {
    this.guideline.principle = this.principleSelect.id;
    this.administratorServices.postGuidelineStudent(this.guideline).subscribe(
      (result) => {
        this.guideline = new Guideline();
        this.retrieveEvaluationData(this.principleSelect.id);
      },
      (err: any) => {
        //console.log(err.error)
      }
    );
  }
  getRetrieveGuideline(id: number) {
    this.administratorServices
      .retrieveEvaluationStudent(id)
      .subscribe((data: any) => {
        this.guidelineList = data.guidelines;
        this.idSelectedPrinciple = id;
      });
  }
  retrieveEvaluationData(id: number) {
    this.getRetrieveGuideline(id);
  }
  //////////////////
  getRetrieveQuestion(id: number) {
    this.administratorServices
      .retrieveEvaluationStudentquestions(id)
      .subscribe((data: any) => {
        this.questionList = data.questions;
        this.idGuidelinePrinciple = id;
      });
  }
  retrieveEvaluationData2(id: number) {
    this.getRetrieveQuestion(id);
  }
  /////////////////

  registerEvaluationData() {
    this.administratorServices.postEvaluationStudent(this.principle).subscribe(
      (data) => {
        this.getEvaluationStudent();
        this.principle = new Principle();
      },
      (err: any) => {
     //   console.log(err);
      }
    );
  }

  updateEvaluationData() {
    this.administratorServices.putEvaluationStudent(this.principle).subscribe(
      (data) => {
        this.getEvaluationStudent();
      },
      (err: any) => {
        // console.log(err);
      }
    );
  }
  saveUpdateGuideline() {
    this.administratorServices
      .updateGuidelineStudent(this.guidelineSelect)
      .subscribe((data) => {
      });
  }
  ////////// guardar del actualizar pdialog
  saveUpdateQuestion() {
    // console.log(this.questionSelect);
    this.administratorServices
      .updateQuestionStudent(this.questionSelect)
      .subscribe((data:any) => {
        if(data.message === "success"){
          this.messageService.add({
            severity: "success",
            summary: "Actualizado",
            detail: "Actualizado correctamente",
          });
        }else{
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Error al actualizar el registro",
          });
        }
      });
  }
  /////////

  deleteGuideline(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorServices
          .deleteGuidelineStudent(id)
          .subscribe((data) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Eliminado correctamente",
            });
            setTimeout(() => {
              this.retrieveEvaluationData(this.idSelectedPrinciple);
            }, 600);
          });
      },
    });
  }

  ////eliminar pregunta
  deleteQuestion(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorServices
          .deleteQuestionStudent(id)
          .subscribe((data) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Eliminado correctamente",
            });
            setTimeout(() => {
              this.retrieveEvaluationData2(this.idGuidelinePrinciple);
            }, 600);
          });
      },
    });
  }
  



  ////

}
