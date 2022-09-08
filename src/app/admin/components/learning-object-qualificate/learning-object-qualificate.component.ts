import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import Swal from 'sweetalert2';
import { AdminComponent } from '../../admin.component';
import { LearningObjects } from '../../models/evaluation.models';
import { EvaluationService } from '../../services/evaluation.service';

@Component({
  selector: 'app-learning-object-qualificate',
  templateUrl: './learning-object-qualificate.component.html',
  styleUrls: ['./learning-object-qualificate.component.scss'],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }
`],
providers: [MessageService, ConfirmationService]
})
export class LearningObjectQualificateListComponent implements OnInit {

  learningobjectList:any[]=[];
  isLoading:boolean = false;
  learningobjectsSelected: LearningObjects[];

  @ViewChild('dt') table: Table;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService:AdministratorService,
    public appMain: AdminComponent,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private evaluationsService: EvaluationService
  ) { 
   
  }

  ngOnInit(): void {
  this.load_data();
  }

  private async load_data(){
  //let resultados = await this.evaluationsService.get_qualification_expert_results().toPromise();    
  //console.log('Resultados', resultados);
  }

  }