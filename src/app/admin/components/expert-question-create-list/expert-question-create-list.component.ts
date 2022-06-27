import { Component, OnInit, ViewChild } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import {
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { Table } from "primeng/table";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import {
  Concept,
  Question,
  QuestionUpdate,
} from "../../models/evaluation.models";

@Component({
  selector: "app-expert-question-create-list",
  templateUrl: "./expert-question-create-list.component.html",
  styleUrls: ["./expert-question-create-list.component.scss"],
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
export class ExpertQuestionCreateListComponent implements OnInit {
  conceptList: Concept[];
  questionList: Question[];
  concept: Concept = new Concept();
  idSelectedConcept: number;
  conceptSelect: Concept = new Concept();
  questionSelect: QuestionUpdate = new QuestionUpdate();
  question: Question = new Question();
  public formSubmit = false;
  @ViewChild("dt") table: Table;

  public registerForm = this.fb.group({
    concept: [null, Validators.required],
  });

  questionDialog: boolean;
  editConceptDialog: boolean;
  createConceptDialog: boolean;
  updateQuestionDialog: boolean;
  submitted: boolean;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder,
    public appMain: AdminComponent,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private administratorServices: AdministratorService
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Preguntas de evaluación para el experto",
        routerLink: ["/admin/expert/question"],
      },
    ]);
  }
  ngOnInit() { 
    this.getEvaluationExpert();
  }
  getEvaluationExpert() {
    this.administratorServices
      .getEvaluationExpert()
      .subscribe((result: any) => {
        this.conceptList = result;
      });
  }
  openNew() {
    this.concept = {};
    this.submitted = false;
    this.createConceptDialog = true;
  }
  deleteEvaluationExpert(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorServices
          .deleteEvaluationExpert(id)
          .subscribe((result: any) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Eliminado correctamente",
            });
            setTimeout(() => {
              this.getEvaluationExpert();
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
    this.editConceptDialog = false;
    this.submitted = false;
  }
  hideDialogUpdateQuestion() {
    this.updateQuestionDialog = false;
    this.submitted = false;
  }
  hideDialog() {
    this.questionDialog = false;
    this.submitted = false;
  }
  hideDialogConcept() {
    this.createConceptDialog = false;
    this.submitted = false;
  }
  openEditConceptDialog(concept: Concept) {
    this.conceptSelect = concept;
    this.submitted = false;
    this.editConceptDialog = true;
  }
  openEditQuestionDialog(question: Question) {
    this.questionSelect = question;
    this.submitted = false;
    this.updateQuestionDialog = true;
  }
  updateConcept() {
    this.submitted = true;
    this.administratorServices
      .putEvaluationExpert(this.conceptSelect)
      .subscribe((data) => {
        this.editConceptDialog = false;
        //console.log(data);
      });
  }
  openQuestion(concept: Concept) {
    this.conceptSelect = concept;
    this.submitted = false;
    this.questionDialog = true;
  }
//aqui
  saveQuestion() {
    this.question.evaluation_concept = this.conceptSelect.id;
    this.administratorServices.postQuestionExpert(this.question).subscribe(
      (result) => {
        this.question = new Question();
        this.retrieveEvaluationData(this.conceptSelect.id);
      },
      (err: any) => {
        //console.log(err.error)
      }
    );
  }

  registerEvaluationData() {
    this.administratorServices.postEvaluationExpert(this.concept).subscribe(
      (data) => {
        this.getEvaluationExpert();
        this.concept = new Concept();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  updateEvaluationData() {
    this.administratorServices.putEvaluationExpert(this.concept).subscribe(
      (data) => {
        this.getEvaluationExpert();
      },
      (err: any) => {
        // console.log(err);
      }
    );
  }
  saveUpdateQuestion() {
    // console.log(this.questionSelect);
    this.administratorServices
      .updateQuestionExpert(this.questionSelect)
      .subscribe((data:any) => {
        if(data.message =="success"){
          this.messageService.add({
            severity: "success",
            summary: "Actualizado",
            detail: "Actualizado correctamente",
          });
        }else{
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo actualizar el registro",
          });
        }
      });
  }
  getRetrieveQuestion(id: number) {
    this.administratorServices
      .retrieveEvaluationExpert(id)
      .subscribe((data: any) => {
        this.questionList = data.questions;
        this.idSelectedConcept = id;
      });
  }
  retrieveEvaluationData(id: number) {
    this.getRetrieveQuestion(id);
  }

  deleteQuestion(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorServices
          .deleteQuestionExpert(id)
          .subscribe((data) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Eliminado correctamente",
            });
            setTimeout(() => {
              this.retrieveEvaluationData(this.idSelectedConcept);
            }, 600);
          });
      },
    });
  }
  //  isload(){
  //    this.loading=true;
  //    setTimeout(()=>this.loading=false,300)
  //  }
}
