import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import Swal from 'sweetalert2';
import { AdminComponent } from '../../admin.component';
import { LearningObjects } from '../../models/evaluation.models';

@Component({
  selector: 'app-learning-object-pending-list',
  templateUrl: './learning-object-pending-list.component.html',
  styleUrls: ['./learning-object-pending-list.component.scss'],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }

`],
providers: [MessageService, ConfirmationService]
})
export class LearningObjectPendingListComponent implements OnInit {
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
    private router: Router
  ) { 
    this.breadcrumbService.setItems([
      { label: 'Objetos de aprendizaje por aprobar',routerLink: ['/admin/learning-object/pending'] },
      ]);
  }

  ngOnInit(): void {
    this.listLearningObject();
  }
  listLearningObject(){
    this.administratorService.listLearningObject(0).subscribe((resp:any)=>{
      //console.log(resp)
      this.isLoading = true;
      this.learningobjectList=resp.results
    })
  }
  click(){
    this.router.navigateByUrl('/admin/learning-object');
  }
  confirm2(event: Event,oaId: number) {
    this.confirmationService.confirm({
        key: 'confirm2',
        target: event.target,
        message: '¿Esta seguro que desea aprobar?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.administratorService.updatePublicandPrivateLearningObject(oaId, 1).subscribe((resp:any)=>{
                this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Aprobado con éxito'});
                setTimeout(()=>{
                  this.listLearningObject();
                },600)
            })
        },
    });
  }
  getDetail(slug:string){
    this.router.navigate([`/admin/learning-object/pending/detail/${slug}`]);
  } 
  }