import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import { LoginService } from 'src/app/services/login.service';
import { SearchService } from 'src/app/services/search.service';
import { LearningObjectService } from 'src/app/services/learning-object.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-view-questions-student',
  templateUrl: './view-questions-student.component.html',
  styleUrls: ['./view-questions-student.component.scss']
})
export class ViewQuestionsStudentComponent implements OnInit {
  @Input() object: ObjectLearning;
  @Output() commentEmit1 = new EventEmitter<boolean>();
  @Output() commentEmit = new EventEmitter<boolean>();
  @Input() flagQuestionsEst: boolean

  public groupedQuestionsSTUDENT: any[];
  public groupedQuestionsUpdate: any[]
  public selectedQuesions: any[];
  public questionsupdates = []
  public resultquestions: any[];
  public subscribes: Subscription[] = [];
  public angForm2: UntypedFormGroup;
  public answerEV: any
  public flagConfirmSt: boolean;

  constructor(
    private searchService: SearchService,
    private loginService: LoginService,
    public fb2: UntypedFormBuilder,
    private messageServicee: MessageService,
    private learningObject: LearningObjectService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {

    this.loadData();
    this.createForm2();

  }
  createForm2() {
    if (!this.flagQuestionsEst) {
      this.angForm2 = this.fb2.group({
        observation:
          [null, [Validators.required]]
      });
    } else if (this.flagQuestionsEst) {
      this.angForm2 = this.fb2.group({
        observation:
          [null, [Validators.required]]
      });
    }
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  async loadData() {
    if ((this.loginService.validateRole('student')) && !this.flagQuestionsEst) {
      let groupedQes = await this.searchService.geQuestionsStudent().subscribe(
        res => {
          this.groupedQuestionsSTUDENT = res.map((item: any) => {
            return {
              value: item.id, label: item.principle, items: item.guidelines.map((item: any) => { return { value: item.id, label: item.guideline, question: item.questions } })
            }
          });
          this.groupedQuestionsSTUDENT = this.groupedQuestionsSTUDENT;
          this.groupedQuestionsSTUDENT.forEach((preguntas) => {
            preguntas.items.forEach((element) => {
              element.question.forEach(element1 => {
                this.angForm2.addControl(
                  element1.id,
                  new UntypedFormControl(null, Validators.required)
                );
              });
            });
          })
        });
      this.subscribes.push(groupedQes);
    } else if (this.flagQuestionsEst) {
      let groupUpdate = await this.searchService.getObjectResultsEvaluationStudent(this.object.id).subscribe(
        res => {
          //console.log(res)
          this.groupedQuestionsUpdate = res.map((item1: any) => {
            return {
              id: item1.id,
              observation: item1.observation,
              evaluation_students: item1.evaluation_students.map((item2: any) => {
                return {
                  idevaluation: item2.id,
                  evaluation_principle: item2.evaluation_principle.principle,
                  principle_gl: item2.principle_gl.map((item3: any) => {
                    return {
                      guideline_pr: item3.guideline_pr.guideline,
                      guideline_evaluations: item3.guideline_evaluations.map((item4: any) => {
                        return {
                          value: item4.id,
                          question_id: item4.question_id,
                          question: item4.question,
                          qualification: item4.qualification
                        }
                      })
                    }
                  }),
                }
              })
            }
          })
          this.groupedQuestionsUpdate = this.groupedQuestionsUpdate;
          this.groupedQuestionsUpdate.forEach(element => {
            element.evaluation_students.forEach(element2 => {
              element2.principle_gl.forEach(element3 => {
                element3.guideline_evaluations.forEach(element4 => {
                  //element4.question_id,
                  //element4.question,
                  //element4.qualification
                  this.angForm2.addControl(
                    element4.question_id,
                    new UntypedFormControl(element4.qualification, Validators.required)
                  );
                });
              });
            });
            /* this.angForm2.addControl(
               "observation",
               new FormControl(element.observation, [Validators.required])
             );*/
            this.angForm2.controls['observation'].setValue(element.observation);
          });
          this.subscribes.push(groupUpdate);
        }
      )
    }

  }
  closeView() {
    if (this.flagQuestionsEst == false) {
      this.angForm2.reset();
    }

    this.commentEmit1.emit(false);
    this.commentEmit.emit(false);
  }
  closeView2() {
    if (this.flagQuestionsEst == true) {
      this.angForm2.reset();
    }
    this.commentEmit.emit(false);

    this.commentEmit1.emit(false);
  }
  getNumber(event) {
    return this.angForm2.get(String(event)).value
  }


  get observation() {
    return this.angForm2.get('observation')
  }

  async sendAnswersStudent() {
    if (!this.flagQuestionsEst) {
      if (this.angForm2.valid) {
        let vecansw = Object.entries(this.angForm2.value)
        let resp = []
        vecansw.forEach(element => {
          let regresar = { id: Number(element[0]), value: element[1] }
          resp.push(regresar)
        });
        resp.pop();
        this.answerEV = {
          "learning_object": this.object.id,
          "results": resp,
          "observation": this.angForm2.get('observation').value
        }
        let sendEvalSt = await this.learningObject.sendQualificationStudent(this.answerEV).subscribe(
          async res => {
            this.commentEmit1.emit(true);
            this.flagConfirmSt = true;
            this.angForm2.reset();
            this.ngOnInit();
            this.closeView2();
            this.showSuccess(await this.languageService.translate.get('object.evaluationMessage').toPromise());
          }, error => {
            this.flagConfirmSt = false;
          }
        );
      } else {
        this.markTouchForm();
        this.showError(await this.languageService.translate.get('object.fillForm').toPromise());
      }
    } else if (this.flagQuestionsEst) {
      ///////
      let vecansw = Object.entries(this.angForm2.value)
      let resp = []
      vecansw.forEach(element => {
        let regresar = { id: Number(element[0]), value: element[1] }
        resp.push(regresar)
      });
      resp.pop();
      this.answerEV = {
        "id": this.groupedQuestionsUpdate[0].id,
        "learning_object": this.object.id,
        "results": resp,
        "observation": this.angForm2.get('observation').value
      }
      ////enviar nuevo path
      let sendEvalSt = await this.learningObject.sendQualificationStudentUpdate(this.answerEV, this.groupedQuestionsUpdate[0].id).subscribe(
        async res => {
          this.commentEmit.emit(false);
          this.commentEmit1.emit(false);
          this.flagConfirmSt = true;
          this.ngOnInit();
          this.showSuccess(await this.languageService.translate.get('object.evaluationMessage').toPromise());
        }, error => {
          this.flagConfirmSt = false;
        }
      );
      ///////
    }
  }

  showError(message) {
    this.messageServicee.add({ severity: 'error', summary: 'Error', detail: message });
  }

  showSuccess(message) {
    this.messageServicee.add({ severity: 'success', summary: 'Success', detail: message });
  }

  markTouchForm() {
    (<any>Object).values(this.angForm2.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  setValueReturnForm(value){
    return this.angForm2.get(String(value));
  }

}
