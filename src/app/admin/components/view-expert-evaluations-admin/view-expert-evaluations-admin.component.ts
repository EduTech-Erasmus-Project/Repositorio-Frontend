import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationService } from '../../services/evaluation.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-view-expert-evaluations-admin',
  templateUrl: './view-expert-evaluations-admin.component.html',
  styleUrls: ['./view-expert-evaluations-admin.component.scss']
})
export class ViewExpertEvaluationsAdminComponent implements OnInit, OnDestroy {
  public angForm2: UntypedFormGroup;
  public groupedQuestionsEx: any[];
  @Input() student_id:number;
  @Input() oa_id:number;
  @Output() displayFormRatingExpert = new EventEmitter<boolean>();
  private subscribes: Subscription[] = [];
  constructor(
    private evaluationsService: EvaluationService,
    public fb2: UntypedFormBuilder,
  ) { }
  ngOnDestroy(): void {
    this.subscribes.forEach((s) => s.unsubscribe());
  }

  ngOnInit(): void {
    this.createForm2();
    this.load_data();
  }


  createForm2() {
    this.angForm2 = this.fb2.group({

    });
  }

  get observation() {
    return this.angForm2.get('observation')
  }

  private async load_data() {

    let resultsEval = await this.evaluationsService.getObjectResultsEvaluationExpertResult_Admin(this.student_id, this.oa_id).subscribe((res) => {
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
      //this.commentEmit.emit(true);
      this.groupedQuestionsEx = this.groupedQuestionsEx;
      this.groupedQuestionsEx.forEach((element) => {
        element.conceptEvaluations.forEach((element1) => {
          element1.questionEvaluations.forEach((element2) => {
            this.angForm2.addControl(
              element2.questionid,
              new UntypedFormControl({value:element2.qualification, disabled: true}, [Validators.required])
            );
          });
        });
        this.angForm2.addControl(
          "observation",
          new UntypedFormControl({value:element.observation , disabled: true}, [Validators.required])
        );
      });
      
    });
    this.subscribes.push(resultsEval)
  }

  closeView() {
    this.displayFormRatingExpert.emit(false);
  }
}
