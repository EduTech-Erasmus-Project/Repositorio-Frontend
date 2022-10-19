import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { AdminComponent } from '../../admin.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User } from '../../models/evaluation.models';

@Component({
  selector: 'app-teacher-approved',
  templateUrl: './teacher-approved.component.html',
  styleUrls: ['./teacher-approved.component.scss'],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }

`],
providers: [MessageService, ConfirmationService]
})
export class TeacherApprovedComponent implements OnInit {
  @ViewChild('dt') table: Table;
  user_student_teacher_lists:any[]=[];
  userList: User[];
  isLoading:boolean = false;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService:AdministratorService,
    public appMain: AdminComponent,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) { 
    this.breadcrumbService.setItems([
      { label: 'Docentes y expertos aprobados',routerLink: ['/admin/teacher/request/approved'] },
  ]);
  }

  ngOnInit(): void {
    this.getTeacherExpertAproved();
  }
  getTeacherExpertAproved(){
    this.administratorService.getTeacherAproved().subscribe((user:any) => {
      this.isLoading=true;
      this.user_student_teacher_lists=user;
    })
  }
  
  getProfile(id:number){
    this.router.navigate([`/admin/teacher/request/approved/teacher-expert-profile/${id}/approved`]);
  }
  getLearningObjectEvaluatedByExpert(id:number){
    this.router.navigate([`/admin/teacher/request/approved/learning-object/evaluated/${id}`]);
  }
  getLearningObjectUploadByTeacher(id:number){
    this.router.navigate([`/admin/teacher/request/approved/learning-object/upload/${id}`]);
  }
  confirm2(event: Event,id:number,teacher_status:number,expert_status: number) {
    this.confirmationService.confirm({
        key: 'confirm2',
        target: event.target,
        message: '¿Esta seguro que desea deshabilitar usuario?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.administratorService.updateTeacherAproved(id,teacher_status,expert_status).subscribe((user:any) => {
            this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Deshabilitado con éxito'});
            setTimeout(()=>{
              this.getTeacherExpertAproved();
            },600)
          })
        },
    });
  }

}
