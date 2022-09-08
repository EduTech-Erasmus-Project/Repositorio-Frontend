import { Component, OnInit ,Input, EventEmitter,Output, OnDestroy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationService } from '../../services/evaluation.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-view-student-evaluations-admin',
  templateUrl: './view-student-evaluations-admin.component.html',
  styleUrls: ['./view-student-evaluations-admin.component.scss']
})
export class ViewStudentEvaluationsAdminComponent implements OnInit, OnDestroy {
public angForm2: FormGroup;
public groupedQuestionsUpdate:any[];
@Input() student_id:number;
@Input() oa_id:number
@Output() displayFormRatingStuden = new EventEmitter<boolean>();
private subscribes: Subscription[] = [];
  constructor(
    private evaluationsService: EvaluationService,
    public fb2: FormBuilder,
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
      observation:
        [{value: null, disabled: true}, [Validators.required]]
    });
  }

  get observation() {
    return this.angForm2.get('observation')
  }
  
  private async load_data() {
    let groupUpdate = await this.evaluationsService.getObjectResultsEvaluationStudentResult_Admin(this.student_id, this.oa_id).subscribe(
      res => {
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
        });

        this.groupedQuestionsUpdate = this.groupedQuestionsUpdate;
        this.groupedQuestionsUpdate.forEach(element => {
          element.evaluation_students.forEach(element2 => {
            element2.principle_gl.forEach(element3 => {
              element3.guideline_evaluations.forEach(element4 => {
                this.angForm2.addControl(
                  element4.question_id,
                  new FormControl({value: element4.qualification, disabled:true}, Validators.required),
                );
              });
            });
          });
          this.angForm2.controls['observation'].setValue(element.observation);
        });
       // this.subscribes.push(groupUpdate);
      }
    )
  }
  
  closeView2(){
    this.displayFormRatingStuden.emit(false);
  }
}
