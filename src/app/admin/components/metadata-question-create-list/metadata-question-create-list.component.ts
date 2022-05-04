import { Component, OnInit, ViewChild } from '@angular/core';
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
  Metadata,
  MetadataUpdate,
} from "../../models/evaluation.models";

@Component({
  selector: 'app-metadata-question-create-list',
  templateUrl: './metadata-question-create-list.component.html',
  styleUrls: ['./metadata-question-create-list.component.scss'],
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
export class MetadataQuestionCreateListComponent implements OnInit {
  conceptList: Concept[];
  schemaList: Metadata[];
  concept: Concept = new Concept();
  idSelectedConcept: number;
  conceptSelect: Concept = new Concept();
  schemaSelect: MetadataUpdate = new MetadataUpdate();
  schema: Metadata = new Metadata();
  public formSubmit = false;
  @ViewChild("dt") table: Table;

  public registerForm = this.fb.group({
    concept: [null, Validators.required],
  });

  schemaDialog: boolean;
  editConceptDialog: boolean;
  createConceptDialog: boolean;
  updateSchemaDialog: boolean;
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
        label: "Preguntas de evaluación automatica",
        routerLink: ["/admin/expert/automatic"],
      },
    ]);
  }

  ngOnInit(): void {
    this.getEvaluationAutomatic();
  }
  getEvaluationAutomatic() {
    this.administratorServices
      .getEvaluationAutomatic()
      .subscribe((result: any) => {
        this.conceptList = result;
      });
  }
  openNew() {
    this.concept = {};
    this.submitted = false;
    this.createConceptDialog = true;
  }
  deleteEvaluationAutomatic(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorServices
          .deleteEvaluationAutomatic(id)
          .subscribe((result: any) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Eliminado correctamente",
            });
            setTimeout(() => {
              this.getEvaluationAutomatic();
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
  hideDialogUpdateSchema() {
    this.updateSchemaDialog = false;
    this.submitted = false;
  }
  hideDialog() {
    this.schemaDialog = false;
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
  openEditSchemaDialog(schema: Metadata) {
    this.schemaSelect = schema;
    this.submitted = false;
    this.updateSchemaDialog = true;
  }
  updateConcept() {
    this.submitted = true;
    this.administratorServices
      .putEvaluationAutomatic(this.conceptSelect)
      .subscribe((data) => {
        this.editConceptDialog = false;
        //console.log(data);
      });
  }
  openSchema(concept: Concept) {
    this.conceptSelect = concept;
    this.submitted = false;
    this.schemaDialog = true;
  }
  saveSchema() {
    this.schema.evaluation_concept = this.conceptSelect.id;
    this.administratorServices.postMetadataExpert(this.schema).subscribe(
      (result) => {
        this.schema = new Metadata();
        this.retrieveEvaluationData(this.conceptSelect.id);
      },
      (err: any) => {
        //console.log(err.error)
      }
    );
  }
  getRetrieveSchema(id: number) {
    this.administratorServices
      .retrieveEvaluationAutomatic(id)
      .subscribe((data: any) => {
        this.schemaList = data.schemas;
        this.idSelectedConcept = id;
      });
  }
  retrieveEvaluationData(id: number) {
    this.getRetrieveSchema(id);
  }
  registerEvaluationData() {
    this.administratorServices.postEvaluationAutomatic(this.concept).subscribe(
      (data) => {
        this.getEvaluationAutomatic();
        this.concept = new Concept();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  updateEvaluationData() {
    this.administratorServices.putEvaluationAutomatic(this.concept).subscribe(
      (data) => {
        this.getEvaluationAutomatic();
      },
      (err: any) => {
        // console.log(err);
      }
    );
  }
  saveUpdateSchema() {
    // console.log(this.questionSelect);
    this.administratorServices
      .updateMetadataExpert(this.schemaSelect)
      .subscribe((data) => {
        //console.log(data);
      });
  }
  deleteSchema(event: Event, id: number) {
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorServices
          .deleteMetadataExpert(id)
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
}
