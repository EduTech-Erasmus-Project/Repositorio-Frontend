import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import Swal from 'sweetalert2';
import { AdminComponent } from '../../admin.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LearningObjects } from '../../models/evaluation.models';

@Component({
  selector: 'app-learning-object-approved-list',
  templateUrl: './learning-object-approved-list.component.html',
  styleUrls: ['./learning-object-approved-list.component.scss'],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }
`],
providers: [MessageService, ConfirmationService]
})
export class LearningObjectApprovedListComponent implements OnInit {
  learningobjectList:any[]=[];
  isLoading:boolean = false;
  learningobjectsSelected: LearningObjects[];

  @ViewChild('dt') table: Table;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService:AdministratorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public appMain: AdminComponent,
    private router: Router
  ) {
    this.breadcrumbService.setItems([
      { label: 'Objetos de aprendizaje aprobados', routerLink: ['/admin/learning-object/approved'] },
      ]);
   }

  ngOnInit(): void {
    this.listLearningObject();
  }
  listLearningObject(){
    this.administratorService.listLearningObject(1).subscribe((resp:any)=>{
      this.isLoading = true;
      this.learningobjectList=resp.results
    })
  }
  click(){
    this.router.navigateByUrl('/admin/learning-object');
  }
  updateLearningObject(id: any, status:number){
    this.administratorService.updatePublicandPrivateLearningObject(id, status).subscribe((resp:any)=>{
      Swal.fire({
        icon: 'success',
        title: 'Actualizado correctamente',
        showConfirmButton: false,
        timer: 1500
      })
      this.listLearningObject();
    }, (err: any) => {
      if (err.statusText.toLowerCase() === "Unauthorized".toLocaleLowerCase()) {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: 'Usuario no autorizado'
        });
      }
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: 'Ocurrio un error'
      });
    });
  }
  confirm2(event: Event,oaId: number) {
    this.confirmationService.confirm({
        key: 'confirm2',
        target: event.target,
        message: '¿Esta seguro que desea ocultar?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.administratorService.updatePublicandPrivateLearningObject(oaId, 0).subscribe((resp:any)=>{
                this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Ocultado con éxito'});
                setTimeout(()=>{
                  this.listLearningObject();
                },600)
            })
        },
    });
  }
  getDetail(slug:string){
    this.router.navigate([`/admin/learning-object/approved/detail/${slug}`]);
  }
  
  evaluation_student(id:number){
    this.router.navigate(['/admin/learning-object/qualified-student/'+id])
  }

  }