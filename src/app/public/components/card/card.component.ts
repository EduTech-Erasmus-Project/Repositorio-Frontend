
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { ConfirmationService, MessageService } from "primeng/api";
import { Subscription } from 'rxjs';
import { LearningObjectService } from 'src/app/services/learning-object.service';
import { LoginService } from "src/app/services/login.service";
import { LanguageService } from "src/app/services/language.service";


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
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadDataAutomatic();
    if (this.roleTeacher) {
      this.loadstudent();
    } else {
      this.loadstudentSingle();
    }
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
        } else {
          this.resultEvalCero = true;
        }
      });
      this.subscribes.push(resultsEval);
    } else {
      let resultsAns = await this.objectService.getResultsEvaluationPriority(this.object.id).subscribe(res => {
        if (res.length > 0) {
          this.resultsEv = res.map((item: any) => { return { concepts: item.concept_evaluations.map((aux: any) => { return { concepto: aux.evaluation_concept, total: aux.average } }) } });
          this.resultsEv = this.resultsEv;
        } else {
          this.resultEvalCero = true;
        }

      });
      this.subscribes.push(resultsAns);
    }

    if (this.expertOptionsView || this.expertOptions) {
      let resultsAns = await this.objectService.getResultsEvaluationSingle(this.object.id).subscribe(res => {
        if (res.length > 0) {
          this.resultsEvViewExpert = res.map((item: any) => { return { concepts: item.concept_evaluations.map((aux: any) => { return { concepto: aux.evaluation_concept, total: aux.average } }) } });
          this.resultsEvViewExpert = this.resultsEvViewExpert;
        } else {
          this.resultEvalCeroExpert = true;
        }
      });
      this.subscribes.push(resultsAns);
    }
  }

  get objectId() {
    return this.object.id
  }

 

  onclickEdid() {

    this.router.navigateByUrl(`settings/edit-object/${this.object.id}`);
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  get roleTeacher() {
    return this.loginService.validateRole("teacher");
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
  async loadstudentSingle() {
    let dataSstudent = await this.objectService.getObjectResultsPublicEvaluationStudentSingle(this.object.id).subscribe(
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
        if (this.resultsEvStudent != null) {
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
        if (this.resultsEvStudent != null) {
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

  async deleteLearningObject(event) {
    this.confirmationService.confirm({
      target: event.target,
      message: await this.languageService.translate.get('object.oaQuestion').toPromise(),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        let eliminar = this.objectService.deleteObjestTeacher(this.object.learning_object_file.id).subscribe(
          async (result: any) => {
            if (result.code === 200) {
              this.loadData();
              this.loadDataAutomatic();
              if (this.roleTeacher) {
                this.loadstudent();
              } else {
                this.loadstudentSingle();
              }
              this.showSuccess(await this.languageService.translate.get('object.delesteSuccess').toPromise());
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
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

get is_adapted_oer(){
  return this.object.is_adapted_oer;
}
}
