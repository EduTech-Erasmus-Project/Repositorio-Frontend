import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'app-teacher-expert-profile',
  templateUrl: './teacher-expert-profile.component.html',
  styles: [
  ]
})
export class TeacherExpertProfileComponent implements OnInit {
  id:number;
  rolText:string="";
  status:string;
  user:any={};
  expert:any={};
  teacher:any={};
  rolesList:any=[];
  lista:any=[];
  isactive:boolean=true;
  isLoading:boolean=false;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private router: ActivatedRoute
  ) { 
    this.id = this.router.snapshot.params['id'];
    this.status = this.router.snapshot.params['status'];
    this.isactive=true;
    this.lista = ['Uno','Dos'];
    this.breadcrumbService.setItems([
     this.status == 'pending' ?
     { label: 'Docentes y expertos por aprobar',routerLink: ['/admin/teacher/request/pending'] }:
     { label: 'Docentes y expertos aprobados',routerLink: ['/admin/teacher/request/approved'] },
     { label: 'Perfil'}
    ]);
  }

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile(){
    if(this.status==='pending'){
      this.administratorService.getTeacherAndExpertToAproveProfile(this.id).subscribe((resp:any)=>{
        this.isLoading =true;
        this.user=resp;
        this.expert = resp.collaboratingExpert;
        this.teacher = resp.teacher;
        this.rolesList=resp.rol_solicitados;
        this.rolesList.length > 1? this.rolText = "Roles solicitados por el usuario":this.rolText = "Rol solicitado por el usuario"
      });
    }
    if(this.status==='approved'){
      this.administratorService.getTeacherAndExpertprovedProfile(this.id).subscribe((resp:any)=>{
        this.isLoading =true;
        this.user=resp;
        this.expert = resp.collaboratingExpert;
        this.teacher = resp.teacher;
        this.rolesList=resp.rol_aprovados;
        this.rolesList.length > 1? this.rolText = "Roles aprobados":this.rolText = "Rol aprobado"
      })
    }
  }
}
