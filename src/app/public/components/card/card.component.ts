
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { ConfirmationService, MessageService } from "primeng/api";
import { Subscription } from 'rxjs';
import { LearningObjectService } from 'src/app/services/learning-object.service';
import { LoginService } from "src/app/services/login.service";


@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent implements OnInit {
  @Input() object: ObjectLearning;
  @Input() teacherOptions?: boolean;
  //Opciones de visualizacion para el experto
  @Input() expertOptions?: boolean;
  @Input() expertOptionsView?: boolean;
  //Opciones de visuzalizacion para el estudiante
  @Input() studentOptions?: boolean;
  @Input() studentOptionsView?: boolean;
  @Output() deleteOptions = new EventEmitter<boolean>();

  public show: boolean = false;
  public showFla: boolean = false;

  private subscribes: Subscription[] = [];
  public resultsEv: any[];
  public resultsEvViewExpert: any[];
public resultEvalCero: boolean = false;
public resultEvalCeroExpert: boolean = false;
  //>>>>>>>>>>>>>>>>>>>>
  public display: boolean = false;
  public displayautomatic: boolean = false;
  public displaystudent: boolean = false;


  public resultsEvAut: any[];

  public resultsEvStudent: any[];
  //>>>>>>>>>>>>>>>>>>>>

  constructor(
    private router: Router,
    private objectService: LearningObjectService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loginService: LoginService, 
  ) { }

  ngOnInit(): void {
  
    this.loadData();
    this.loadDataAutomatic();
    this.loadstudent();

  }
  //>>>>>>>>>>>>>>>>>>>>>
  showDialog() {
    this.display = true;
  }
  showDialogstudent() {
    this.displaystudent = true;
  }
  showDialogautomatic() {
    this.displayautomatic = true;
  }

  //>>>>>>>>>>>>>>>>>>>>

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }


  navigateTo() {
    this.router.navigate(['/object', this.object.slug])
  }

  async loadData() {
    if (this.roleExpert) {
      let resultsEval = await this.objectService.getObjectResultsEvaluation(this.object.id).subscribe(res => {
        if (res.length > 0) {
          this.resultsEv = res.map((item: any) => {
            return {
              conceptEvaluations: item.concept_evaluations.map((item1: any) => {
                return {
                  evaluationConcept: item1.evaluation_concept.concept,
                  average: item1.average,
                  questionEvaluations: item1.question_evaluations.map((item2: any) => { return { value: item2.id, questions: item2.question, qualification: item2.qualification } }),
                }
              }),
              observation: item.observation,
              id: item.id,
            }
          });
        }
      });
      this.subscribes.push(resultsEval);
    } else{
      let resultsAns = await this.objectService.getResultsEvaluation(this.object.id).subscribe(res => {
        if(res.length >0){ 
          this.resultsEv = res.map((item: any) => { return { concepts: item.concept_evaluations.map((aux: any) => { return { concepto: aux.evaluation_concept, total: aux.average } }) } });
          this.resultsEv = this.resultsEv;
        }else{
         this.resultEvalCero = true;
        }

      });
      this.subscribes.push(resultsAns);
    }

    if(this.expertOptions || this.expertOptionsView) {
      let resultsAns = await this.objectService.getResultsEvaluation(this.object.id).subscribe(res => {
        if(res.length >0){
          this.resultsEvViewExpert = res.map((item: any) => { return { concepts: item.concept_evaluations.map((aux: any) => { return { concepto: aux.evaluation_concept, total: aux.average } }) } });
          this.resultsEvViewExpert = this.resultsEvViewExpert;
        }else{
          this.resultEvalCeroExpert = true;
        }
      });
      this.subscribes.push(resultsAns);
    }

  }

  get objectId() {
    return this.object.id
  }

  confirmDelete(evt) {
    this.confirmationService.confirm({
      target: evt.target,
      message: "¿Estás segura de que quieres continuar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.messageService.add({
          severity: "info",
          summary: "Eliminado",
          detail: "Se ha eliminado el objeto de aprendizaje",
        });
      },
      reject: () => { },
    });
  }

  onclickEdid() {
   
    this.router.navigateByUrl(`settings/edit-object/${this.object.id}`);
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }



  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  async loadDataAutomatic() {
    let resultsEvalAutomatic = await this.objectService.getObjectResultsEvaluationAutomatic(this.object.id).subscribe(
      res => {
        this.resultsEvAut = res.map((item: any) => {
          return {
            rating: item.rating_schema,
            metadata_concept_evaluations: item.metadata_concept_evaluations.map((item1: any) => {
              return {
                evaluationConcept: item1.evaluation_concept.concept,
                average: item1.average_schema,
                metadata_evaluations: item1.metadata_evaluations.map((item2: any) => {
                  return {
                    value: item2.id,
                    schema: item2.schema,
                    qualification: item2.qualification,
                    description: item2.description
                  }
                }),
              }
            })
          }
        });
        this.resultsEvAut = this.resultsEvAut
      
      }
    )
    this.subscribes.push(resultsEvalAutomatic);
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  async loadstudent() {
    let dataSstudent = await this.objectService.getObjectResultsPublicEvaluationStudent(this.object.id).subscribe(
      res => {
        if (res.length > 0) {
          this.resultsEvStudent = res.map((item: any) => {
            return {
              rating_student: item.rating,
              observation: item.observation,
              evaluation_students: item.evaluation_students.map((item2: any) => {
                return {
                  average_principle: item2.average_principle,
                  evaluation_principle: item2.evaluation_principle,
                  principle_gl: item2.principle_gl.map((item3: any) => {
                    return {
                      average_guideline: item3.average_guideline,
                      guideline_pr: item3.guideline_pr.guideline,
                      guideline_evaluations: item3.guideline_evaluations.map((item4: any) => {
                        return {
                          question: item4.question,
                          qualification: item4.qualification,
                          interpreter_st_yes: item4.interpreter_st_yes,
                          interpreter_st_no: item4.interpreter_st_no,
                          interpreter_st_partially: item4.interpreter_st_partially,
                          metadata: item4.metadata
                        }
                      })
                    }
                  })
                }
              })
            }
          });
        }
        let test = []
        if(this.resultsEvStudent != null) {
          this.resultsEvStudent.forEach(element => {
            element.evaluation_students.forEach(element2 => {
              test.push(element2.average_principle)
            });
          })
        }
      
      }
    );
  this.subscribes.push(dataSstudent);
  }

  navigateToReport(valid: boolean) {
    if (valid) {
      let extras: NavigationExtras = {
        queryParams: { rstudent: true },
      };
      this.router.navigate(['/report', this.object.slug], extras)
    } else {
      this.router.navigate(['/report', this.object.slug])
    }
  }

  deleteLearningObject(event){
    this.confirmationService.confirm({
      target: event.target,
      message: 'Esta seguro que desea eliminar el OA?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
          //confirm action
          let eliminar = this.objectService.deleteObjestTeacher(this.object.learning_object_file.id).subscribe(
            (result:any) => {
              if(result.code === 200){
                this.loadData();
                this.loadDataAutomatic();
                this.loadstudent();
                this.showSuccess('Se Elimino el registro correctamente');
                this.deleteOptions.emit(true);
              }
            }
          );
      },
      reject: () => {
          //reject action
      }
  });

  }

  showSuccess(message) {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
}


}
