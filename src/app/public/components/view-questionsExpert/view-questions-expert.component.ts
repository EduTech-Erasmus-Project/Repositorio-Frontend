import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { Message, MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { LanguageService } from "src/app/services/language.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";
@Component({
  selector: "app-view-questions-expert",
  templateUrl: "./view-questions-expert.component.html",
  styleUrls: ["./view-questions-expert.component.scss"],
})
export class ViewQuestionsExpertComponent implements OnInit {
  @Input() object: ObjectLearning;
  @Output() commentEmit = new EventEmitter<boolean>();
  @Output() commentEmit1 = new EventEmitter<boolean>();
  @Input() flagQuestionsEx: boolean;
  public groupedQuestionsEx: any[];
  public resQuesionsEx: any[];

  public displayFormRatingExpert: boolean = false;
  public subscribes: Subscription[] = [];
  public angForm: UntypedFormGroup;
  public answers: any;
  public msgs1: Message[];
  public flagConfirm: boolean;

  constructor(
    private searchService: SearchService,
    private fb: UntypedFormBuilder,
    private learningObject: LearningObjectService,
    private loginService: LoginService,
    private messageServicee: MessageService,
    private languageService: LanguageService
  ) { }

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.createForm();
  }

  createForm() {
    if (this.flagQuestionsEx == false) {
      this.angForm = this.fb.group({
        //observation: [null, [Validators.required]],
        observation: [null,Validators.required],
      });
    } else if (this.flagQuestionsEx == true) {
      this.angForm = this.fb.group({});
    }
  }

  async loadData() {
    if (
      this.loginService.validateRole("expert") &&
      this.flagQuestionsEx == false
    ) {
      let groupedQex = await this.searchService
        .geQuestionsExpert()
        .subscribe((res) => {
          this.groupedQuestionsEx = res.map((item: any) => {
            return {
              value: item.id,
              label: item.concept,
              items: item.questions.map((item: any) => {
                return {
                  value: item.id,
                  label: item.question,
                  description: item.description,
                  schema: item.schema,
                };
              }),
            };
          });
          this.groupedQuestionsEx = this.groupedQuestionsEx;
          this.groupedQuestionsEx.forEach((element) => {
            element.items.forEach((item) => {
              this.angForm.addControl(
                item.value,
                new UntypedFormControl(null, Validators.required)
              );
            });
          });
        });

      this.subscribes.push(groupedQex);
    } else if (
      this.loginService.validateRole("expert") &&
      this.flagQuestionsEx == true
    ) {
      let resultsEval = await this.learningObject
        .getObjectResultsEvaluation(this.object.id)
        .subscribe(async (res) => {
          this.groupedQuestionsEx = res.map((item: any) => {
            return {
              conceptEvaluations: item.concept_evaluations.map((item1: any) => {
                return {
                  evaluationConcept: item1.evaluation_concept.concept,
                  average: item1.average,
                  questionEvaluations: item1.question_evaluations.map(
                    (item2: any) => {
                      return {
                        value: item2.id,
                        questions: item2.question,
                        qualification: item2.qualification,
                        questionid: item2.question_id,
                      };
                    }
                  ),
                };
              }),
              observation: item.observation,
              id: item.id,
            };
          });
         
          await this.createFormControl();
        });
      this.subscribes.push(resultsEval);
    }
  }

  /**
   * Funcion para crear los controles con formControl
   * @method createFormControl
   */
  private  createFormControl(){
 //this.commentEmit.emit(true);
 this.groupedQuestionsEx = this.groupedQuestionsEx;
 this.groupedQuestionsEx.forEach((element) => {
   element.conceptEvaluations.forEach((element1) => {
     element1.questionEvaluations.forEach((element2) => {
       this.angForm.addControl(
         element2.questionid,
         new UntypedFormControl(element2.qualification, [Validators.required])
       );
     });
   });
   this.angForm.addControl(
     "observation",
     new UntypedFormControl(element.observation, [Validators.required])
   );
 });
 
  }

  async sendAnswersExcpert() {
    if (this.angForm.valid) {
      //let valuesAux = this.groupedQuestionsEx.map((item:any) =>  item.items.map((itemE:any) => itemE.value));
      /*let vectAux = Object.keys(this.angForm.controls).forEach(key => {
        let childControl = key;
       return { id: key,value:this.angForm.get(childControl).value}
      });*/

      if (this.flagQuestionsEx == false) {

        let vectAux = Object.entries(this.angForm.value);
        let vectRe = [];
        vectAux.forEach((item) => {
          let regresar = {
            id: Number(item[0]),
            value: item[1],
          };
          vectRe.push(regresar);
        });
        //Eliminamos el ultimo elemento, por las observaciones.
        vectRe.pop();

        this.answers = {
          learning_object: this.object.id,
          results: vectRe,
          observation: this.angForm.get("observation").value,
        };
        
        let sendEval = await this.learningObject
          .sendQualificationExpert(this.answers)
          .subscribe(
            async (res) => {
              this.commentEmit1.emit(true);
              this.flagConfirm = true;
              this.ngOnInit();
              this.showSuccess(
              await this.languageService.translate.get('object.evaluationMessage').toPromise()
              );
               this.angForm.reset();
            },
            (error) => {
              this.flagConfirm = false;
            }
          );

       this.subscribes.push(sendEval);
       

      } else if (this.flagQuestionsEx == true) {
        let vectAux = Object.entries(this.angForm.value);
        let vectRe = [];

        vectAux.forEach((item) => {
          let regresar = {
            id: Number(item[0]),
            value: item[1],
          };
          vectRe.push(regresar);
        });
        //Eliminamos el ultimo elemento, por las observaciones.
        vectRe.pop();

        this.answers = {
          id: this.groupedQuestionsEx[0].id,
          learning_object: this.object.id,
          results: vectRe,
          observation: this.angForm.get("observation").value,
        };
        let sendEvalUpdate = await this.learningObject
          .sendQualificationExpertUpdate(
            this.answers,
            this.groupedQuestionsEx[0].id
          )
          .subscribe(
            async (res) =>{
              this.showSuccess( await this.languageService.translate.get('object.successSendData').toPromise());
              this.commentEmit.emit(false);
            },
            async (error) => {
              this.showError(
                await this.languageService.translate.get('object.messageErrorUpdate').toPromise()
              );
            }
          );
        this.subscribes.push(sendEvalUpdate);
      }
    } else {
      this.markTouchForm();
      this.showError( await this.languageService.translate.get('object.fillForm').toPromise());
    }
  }

  showError(message) {
    this.messageServicee.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  }

  showSuccess(message) {
    this.messageServicee.add({
      severity: "success",
      summary: "Success",
      detail: message,
    });
  }

  markTouchForm() {
    (<any>Object).values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  get observation() {
    return this.angForm.get("observation");
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  closeView() {
    if (this.flagQuestionsEx == false) {
      this.angForm.reset();
    }

    this.commentEmit.emit(false);
  }
  
  setValueReturnForm(value){
    return this.angForm.get(String(value));
  }
}
