import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Message } from "primeng/api";
import { Subscription } from "rxjs";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-evaluations-expert",
  templateUrl: "./evaluations-expert.component.html",
  styleUrls: ["./evaluations-expert.component.css"],
})
export class EvaluationsExpertComponent implements OnInit {
  @Input() resultsEv: any[];
  @Input() object: any;
  @Input() changeView : boolean;
  @Output() commentEmit = new EventEmitter<boolean>();

  private subscribes: Subscription[] = [];
  public groupedQuestionsEx: any[];
  public groupedQuestionsTeacher: any[];
  public angForm: FormGroup;

  public flagConfirm: boolean = false;

  public msgs1: Message[];

  public answers: any;

  constructor(
    private objectService: LearningObjectService,
    private loginService: LoginService,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  createForm() {
    this.angForm = this.fb.group({});
  }

  async loadData() {
    if (this.roleStudent && (!this.roleExpert && !this.roleTeacher)) {
      let resultsAns = await this.objectService
        .getResultsEvaluation(this.object)
        .subscribe((res) => {
          //console.log("lA RESP",res);
          this.resultsEv = res.results.map((item: any) => {
            return {
              concepts: item.concept_evaluations.map((aux: any) => {
                return { concepto: aux.evaluation_concept, total: aux.average };
              }),
            };
          });
          this.resultsEv = this.resultsEv;
          // console.log("Pregun",this.resultsEv);
        });
      this.subscribes.push(resultsAns);
    } else if (this.roleExpert) {
      let resultsEval = await this.objectService
        .getObjectResultsEvaluation(this.object)
        .subscribe((res) => {
          this.groupedQuestionsEx = res.results.map((item: any) => {
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
                      };
                    }
                  ),
                };
              }),
              observation: item.observation,
              id: item.id,
            };
          });

          //this.commentEmit.emit(true);
          this.groupedQuestionsEx = this.groupedQuestionsEx;
          this.groupedQuestionsEx.forEach((element) => {
            element.conceptEvaluations.forEach((element1) => {
              element1.questionEvaluations.forEach((element2) => {
                this.angForm.addControl(
                  element2.value,
                  new FormControl(element2.qualification, Validators.required)
                );
              });
            });

            this.angForm.addControl(
              "observation",
              new FormControl(element.observation, [Validators.required])
            );

            if (element.observation) {
              this.flagConfirm = true;
            } else {
              this.flagConfirm = false;
            }
          });
        });

      this.subscribes.push(resultsEval);
    } else if (this.roleTeacher) {
      let resultsTeacher = await this.objectService
        .getResultsEvaluation(this.object)
        .subscribe((res) => {
          this.groupedQuestionsTeacher = res.results.map((item: any) => {
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
                      };
                    }
                  ),
                };
              }),
              observation: item.observation,
              id: item.id,
            };
          });
          this.groupedQuestionsTeacher = this.groupedQuestionsTeacher;
        });
      this.subscribes.push(resultsTeacher);
    }
  }

  get roleExpert() {
    // console.log("Rol",this.loginService.validateRole('collaboratingExpert'));
    return this.loginService.validateRole("expert");
  }

  get roleStudent() {
    // console.log("Rol",this.loginService.validateRole('collaboratingExpert'));
    return this.loginService.validateRole("student");
  }

  get roleTeacher() {
    // console.log("Rol",this.loginService.validateRole('collaboratingExpert'));
    return this.loginService.validateRole("teacher");
  }

  get observation() {
    return this.angForm.get("observation");
  }
}
