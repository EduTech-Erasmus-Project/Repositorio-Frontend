import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { SearchService } from 'src/app/services/search.service';
import Swal from 'sweetalert2';
import { AdminComponent } from '../../admin.component';
import { LearningObjects } from '../../models/evaluation.models';
import { EvaluationService } from '../../services/evaluation.service';

@Component({
  selector: 'app-learning-object-qualificate-expert',
  templateUrl: './learning-object-qualificate-expert.component.html',
  styleUrls: ['./learning-object-qualificate-expert.component.scss'],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }
`],
  providers: [MessageService, ConfirmationService]
})
export class LearningObjectQualificateExpertListComponent implements OnInit {
  learningobjectList: any[] = [];
  public isLoading: boolean = false;
  learningobjectsSelected: LearningObjects[];
  private id_learningobject: number = 0;
  @ViewChild('dt') table: Table;
  public groupedQuestionsUpdate: any[];
  public angForm2: FormGroup;
  public displayFormRatingStuden: boolean = false;
  public student_id: number = 0;
  public oa_id: number = 0;
  public boolean_display: any[];
  public concep_evaluations: any[];
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
    public fb2: FormBuilder,
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
    let resultados: any = await this.evaluationsService.get_qualification_expert_results(this.id_learningobject).toPromise();
    let data = resultados.results;
    console.log(data);
    data.forEach((value) => {
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


  confirm(event: Event, is_principal, id_collaborating_expert) {

    if (is_principal == false) {
      this.confirmationService.confirm({
        target: event.target,
        message: 'Esta seguro que desea priorizar esta calificación?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          //this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Evaluacion prioritaria' });
          let object={
            is_priority: 'True',
          }
          let update = this.evaluationsService.update_qualification_expert_results(id_collaborating_expert,object).toPromise();
          update.then((results:any) => {
            console.log(results);
            if(results.status == 200){
              this.load_data();
            }else{
              this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Error al tratar de actualizar el registro' });
            }
          })
        },
        reject: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error no se actualizo el registro' });
        }
      });
    }
  }

  public class_color(is_principal) {
    return (is_principal == true) ? 'p-button-success' : 'p-button-primary';
  }

  public name_label(is_principal) {
    return (is_principal == true) ? 'Prioritario' : 'Priorizar';
  }
}