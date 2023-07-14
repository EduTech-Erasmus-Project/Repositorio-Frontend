import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Table } from "primeng/table";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import {
  Concept,
  Metadata,
  MetadataUpdate,
  SelfQuestion,
} from "../../models/evaluation.models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-metadata-question-create-list",
  templateUrl: "./metadata-question-create-list.component.html",
  styleUrls: ["./metadata-question-create-list.component.scss"],
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
export class MetadataQuestionListComponent implements OnInit, OnDestroy {
  selfQuestionList: SelfQuestion[];
  schemaList: Metadata[];
  selfQuestion: SelfQuestion = new SelfQuestion();
  idSelectedConcept: number;
  selfQuestionSelect: SelfQuestion = new SelfQuestion();
  schemaSelect: MetadataUpdate = new MetadataUpdate();
  schema: Metadata = new Metadata();
  metadataSchemas: Metadata[] = [];
  metadataSchemasFilter: Metadata[] = [];
  conceptEvaluation : Concept[]=[];
  public formSubmit = false;
  public metadataSchemaQuestion = {
    id_schema: 0,
    id_question: 0,
    id_concept :0
  };
  public descriptionMetadata : string = "";
  @ViewChild("dt") table: Table;

  public registerForm = this.fb.group({
    description: [null, Validators.required],
  });

  schemaDialog: boolean;
  editConceptDialog: boolean;
  createConceptDialog: boolean;
  updateSchemaDialog: boolean;
  submitted: boolean;
  private subscriptions: Subscription[] = [];
  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: UntypedFormBuilder,
    public appMain: AdminComponent,
    public router: Router,
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
  ngOnDestroy(): void {
    this.subscriptions.forEach((res)=>{ res.unsubscribe(); });
  }

  ngOnInit(): void {
    this.getEvaluationAutomatic();
    this.getMetadataSchema();
    this,this.getEvaluationConcept();
  }

  /**
   * funcion para retornar las evaluaciones de concepto
   * @method getEvaluationConcept
   */
  private async getEvaluationConcept(){
    try{
      let evaluationConcept : any = await this.administratorServices.getEvaluationExpert().toPromise(); 
      if(evaluationConcept.length > 0){
          this.conceptEvaluation = evaluationConcept;
        }
    } catch{
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar los conceptos de evaluacion",
      });
    } 
    
  }

  getEvaluationAutomatic() {
    this.administratorServices
      .getEvaluationAutomaticQuestion()
      .subscribe((result: any) => {
        this.selfQuestionList = result;
      });
  }

  private async getMetadataSchema() {
    try {
      let metadata = await this.administratorServices
        .getMetadataConceptQuestionsExpert()
        .toPromise();
      if (metadata.length > 0) {
        this.metadataSchemas = metadata;
      }
    } catch (error) {
      this.messageService.add({
        summary: "error",
        severity: "Error",
        detail: "No se pudo cargar los metadatos",
      });
    }
  }
  openNew() {
    this.selfQuestion = {};
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
  openEditConceptDialog(concept: SelfQuestion) {
    this.selfQuestionSelect = concept;
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
    let dataUpdate = {
      id: this.selfQuestionSelect.id,
      description: this.selfQuestionSelect.description,
      descriptionEnglish : this.selfQuestionSelect.descriptionEnglish,
      evaluation_concept: this.selfQuestionSelect.evaluation_concept
    };
    
    this.administratorServices
      .putEvaluationAutomaticQuestion(dataUpdate)
      .subscribe((data) => {
        this.editConceptDialog = false;
        this.messageService.add({
          severity:'success',
          summary:'Satisfactoriamente',
          detail:'Pregunta actualizada correctamente'
        })
      }, err => {
        this.messageService.add({
          severity:'error',
          summary:'Error',
          detail:err.message || 'Error al actualizar la pregunta' 
        })
      });
  }

  async openSchema(selfQuestion: SelfQuestion) {
    this.selfQuestionSelect = selfQuestion;
    this.metadataSchemaQuestion.id_question = selfQuestion.id;
    this.metadataSchemaQuestion.id_concept = selfQuestion.evaluation_concept;
    this.captureConceptId();
    this.submitted = false;
    this.schemaDialog = true;
  }

  /**
   * Funcion para guardar la relacion del metadato
   * con la pregunta
   * @method saveSchema
   */
  async saveSchema() {
    try {
      let schemaDetail: any = await this.administratorServices
        .putRelatioshipQuestionMetadata(this.metadataSchemaQuestion)
        .toPromise();
      if (schemaDetail.code === 200) {
        this.messageService.add({
          severity: "success",
          summary: "Exitosamente",
          detail: "Se guardo los datos con exito",
        });
        this.schemaDialog = false;
        this.metadataSchemaQuestion = {
          id_schema: 0,
          id_question: 0,
          id_concept:0
        };
      }
    } catch (error) {
      this.messageService.add({
        summary: "error",
        severity: "Error",
        detail: "Error al guardar los datos",
      });
    }
  }

  getRetrieveSchema(id: number) {
    this.administratorServices
      .retrieveEvaluationAutomaticQuestion(id)
      .subscribe((data: any) => {
        this.schemaList = data.schemas_questions;
        this.idSelectedConcept = id;
      });
  }

  retrieveEvaluationData(id: number) {
    this.metadataSchemaQuestion.id_question = id;
    this.getRetrieveSchema(id);
  }

  registerEvaluationData() {
    this.administratorServices
      .postEvaluationAutomaticQuestion(this.selfQuestion)
      .subscribe(
        (data) => {
          this.getEvaluationAutomatic();
          this.selfQuestion = new SelfQuestion();
          this.createConceptDialog = false;
        },
        (err: any) => {
          console.log(err);
        }
      );
  }
  updateEvaluationData() {
    this.administratorServices
      .putEvaluationAutomatic(this.selfQuestion)
      .subscribe(
        (data) => {
          this.getEvaluationAutomatic();
        },
        (err: any) => {
        }
      );
  }
  saveUpdateSchema() {
    this.administratorServices
      .updateMetadataExpert(this.schemaSelect)
      .subscribe((data) => {
        //console.log(data);
      });
  }

  deleteSchema(event: Event, id: number) {
    this.metadataSchemaQuestion.id_schema = id;
    this.confirmationService.confirm({
      key: "confirmDelete",
      target: event.target,
      message: "Esta seguro que desea eliminar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
          this.deleteRegister();
      },
    });
  }

  async deleteRegister(){
    let delete_register  = await this.administratorServices
          .deleteRelatioshipQuestionMetadata(this.metadataSchemaQuestion)
          .subscribe(
            (data: any) => {
              if (data.code == 200) {
                this.messageService.add({
                  severity: "info",
                  summary: "Confirmed",
                  detail: "Eliminado correctamente",
                });
                setTimeout(() => {
                  this.retrieveEvaluationData(this.metadataSchemaQuestion.id_question);
                }, 600);
              }
            },
            (error) => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Error al eliminar el registro",
              });
            }
          );
          this.subscriptions.push(delete_register);
  }

  /**
   * funcion para capturar la descripcion del metadato 
   * y mostrarlo en el apartador de description
   * @method captureDescriptionSchema
   * @param evento 
   */
  public captureDescriptionSchema(){
    let filter = this.metadataSchemas.filter(id => id.id === this.metadataSchemaQuestion.id_schema );
    this.descriptionMetadata = filter[0]?.description;
  }

  /**
   * funcion para capturar el id del concepto para relacionarlo con la pregunta 
   * @method captureConceptId
   */
  private captureConceptId(){
    this.metadataSchemasFilter = [];
    let filterArray = this.metadataSchemas.filter(res=>res.evaluation_concept == this.metadataSchemaQuestion.id_concept);
    this.metadataSchemasFilter=filterArray;
  }

  /**
   * Eliminar preguntas para evaluacion
   * @method deleteSelfQuestion
   */
  public async  deleteSelfQuestion(event, idSelfQuestion:number){
    let deletSelf = await this.administratorServices.deleteSelfQuestion(idSelfQuestion).subscribe(
      (res:any)=>{
        if(res.code === 200){
          this.messageService.add({
            severity: "success",
            summary: "Exitoso",
            detail: "Se elimino el registro exitosamente",
          });
          this.ngOnInit();
        }else{
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Error al eliminar el registro",
          });
        }
      }, err => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Error al eliminar el registro",
        });
      }
    );
    this.subscriptions.push(deletSelf);
  }
}
