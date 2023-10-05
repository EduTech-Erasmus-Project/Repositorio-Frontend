import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LearningObjectService } from "../../../services/learning-object.service";
import { Subscription } from "rxjs";
import { Message, MessageService } from "primeng/api";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { LoginService } from "src/app/services/login.service";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";

@Component({
  selector: "app-object",
  templateUrl: "./object.component.html",
  styleUrls: ["./object.component.scss"],
})
export class ObjectComponent implements OnInit, OnDestroy {
  //private slug:string;
  public objectData: ObjectLearning;
  private subscribes: Subscription[] = [];
  public commentsData: any;
  public metadata: any;
  public showMetadata: boolean = false;
  public embedCode: string;
  public msgsCopy: Message[];
  public changeView: boolean;
  public angForm: UntypedFormGroup;
  public disabled

  public flagConfirm: boolean = false;
  public groupedQuestionsEx: any[];
  public groupedQuestionsTeacher: any[];
  public resultsEva: any[];
  public ObjectID: number;
  constructor(
    private route: ActivatedRoute,
    private objectService: LearningObjectService,
    private router: Router,
    private messageService: MessageService,
    private loginService: LoginService,
    private fb: UntypedFormBuilder,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {
    this.route.params.subscribe((params) => {
      //this.loading = true;
      this.getObjectDetail(params.slug);
      this.add_breadcrumb(params.slug);
      //console.log(params.slug)
    });
    this.createForm();

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscribes.forEach((item) => {
      item.unsubscribe();
    });
  }
  createForm() {
    this.angForm = this.fb.group({});
  }

  private async add_breadcrumb(slug: string) {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await this.languageService.translate.get('menu.learningObject').toPromise() },
      { label: slug, routerLink: ["/object/" + slug] },
    ]);
  }

  async getObjectDetail(slug: string) {
    let detailSub = await this.objectService.getObjectDetail(slug).subscribe(
      (res: any) => {
        this.objectData = res;
        this.loadData();
        this.embedCode = `<iframe id='roa_iframe' src='${this.objectData.learning_object_file.url}' style='border:0; width:100%; height:100%' iframeborder='0' frameborder='0' iframeElement.frameBorder = 0; webkitallowfullscreen mozallowfullscreen allowfullscreen ></iframe>`;
        this.loadComments(res.id);
        this.objectService.interactionSideObjectSelect.emit(res);
      },
      (err) => {

        this.router.navigateByUrl("/**");
      }
    );
    this.subscribes.push(detailSub);
  }

  async loadComments(id: number) {
    let commentSub = await this.objectService
      .getComments(id)
      .subscribe((res: any) => {
        this.commentsData = res;

      });
    this.subscribes.push(commentSub);
  }

  coutComment(evt) {

    this.commentsData.count += evt;
  }

  async copyText() {
    //this.messageService.clear();
    navigator.clipboard.writeText(this.embedCode).then(
      async () => {
        this.messageService.add({
          severity: "success",
          summary: await this.languageService.translate.get('message.copy').toPromise(),
          detail: await this.languageService.translate.get('buttons.copyWebSuccess').toPromise(),
        });
      },
      async (err) => {
        //console.error("Async: Could not copy text: ", err);
        this.messageService.add({
          severity: "error",
          summary: await this.languageService.translate.get('message.titleError').toPromise(),
          detail: await this.languageService.translate.get('buttons.resetOther').toPromise(),
        });
      }
    );
  }

  coutComment1(evt) {
    if (evt == true) {

      this.loadData();
    }
  }


  async loadData() {
    if (this.roleStudent && (!this.roleExpert && !this.roleTeacher)) {
      let resultsAns = await this.objectService
        .getResultsEvaluation(this.objectData.id)
        .subscribe((res) => {
          this.resultsEva = res.map((item: any) => {
            return {
              concepts: item.concept_evaluations.map((aux: any) => {
                return { concepto: aux.evaluation_concept, total: aux.average };
              }),
            };
          });
          this.resultsEva = this.resultsEva;

        });
      this.subscribes.push(resultsAns);
    } else if (this.roleExpert) {
      let resultsEval = await this.objectService
        .getObjectResultsEvaluation(this.objectData.id)
        .subscribe((res) => {

          if (res.length > 0) {
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
                    new UntypedFormControl(element2.qualification, Validators.required)
                  );
                });
              });

              this.angForm.addControl(
                "observation",
                new UntypedFormControl(element.observation, [Validators.required])
              );

              if (element.observation) {
                this.flagConfirm = true;
              } else {
                this.flagConfirm = false;
              }
            });

          }


        });

      this.subscribes.push(resultsEval);
    } else if (this.roleTeacher) {
      let resultsTeacher = await this.objectService
        .getResultsEvaluation(this.objectData.id)
        .subscribe((res) => {
          this.groupedQuestionsTeacher = res.map((item: any) => {
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
