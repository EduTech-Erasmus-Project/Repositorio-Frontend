import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import Swal from 'sweetalert2';
import { AdminComponent } from '../../admin.component';
import { LearningObjects } from '../../models/evaluation.models';
import { EvaluationService } from '../../services/evaluation.service';
import { SearchService } from 'src/app/services/search.service';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-learning-object-qualificate-student',
  templateUrl: './learning-object-qualificate-student.component.html',
  styleUrls: ['./learning-object-qualificate-student.component.scss'],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }
`],
  providers: [MessageService, ConfirmationService]
})
export class LearningObjectQualificateStudentListComponent implements OnInit {

  learningobjectList: any[] = [];
  public isLoading: boolean = false;
  learningobjectsSelected: LearningObjects[];
  private id_learningobject: number = 0;
  @ViewChild('dt') table: Table;
  public groupedQuestionsUpdate: any[];
  public angForm2: UntypedFormGroup;
  public displayFormRatingStuden : boolean = false;
  public student_id : number = 0;
  public oa_id:number = 0;
  public boolean_display : any[];
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    public appMain: AdminComponent,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private evaluationsService: EvaluationService,
    private _activeRoute: ActivatedRoute,
    private searchService: SearchService,
    public fb2: UntypedFormBuilder,
  ) {
    this.breadcrumbService.setItems([
      { label: 'Objetos de aprendizaje calificados por el estudiante', routerLink: ['/admin/learning-object/qualified-student'] },
    ]);
    if (isNaN(+this._activeRoute?.snapshot.params?.id)) {
      this.router.navigate(['/admin/learning-object/approved']);
      return;
    }
    this.id_learningobject = +this._activeRoute.snapshot.params.id;
  }

  ngOnInit(): void {
    this.load_data();
  }

  private async load_data() {
    let resultados: any = await this.evaluationsService.get_qualification_student_results(this.id_learningobject).toPromise();
    let data = resultados.results;
    data.forEach((value)=>{
      value.boolean_display = false;
      value.rating = value.rating.toFixed(2);
    })
    if (data.length == 0) {
      this.router.navigate(['/admin/learning-object/approved']);
    }
    this.learningobjectList = data;
    this.isLoading = true;
  }

  public join_last_name_first_name(first_name, last_name) {
    return first_name + ' ' + last_name;
  }
  cahnge_value(event){
    this.displayFormRatingStuden = event;
  }

}