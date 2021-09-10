import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { UserService } from '../../services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdministratorService } from 'src/app/services/administrator.service';
import { User } from '../../models/evaluation.models';

@Component({
  selector: 'app-administrator-user-list',
  templateUrl: './administrator-user-list.component.html',
  styleUrls: ['./administrator-user-list.component.scss'],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }

`],
providers: [MessageService, ConfirmationService]
})
export class AdministratorUserListComponent implements OnInit {
  uselrAdminList:any[]=[];
  isLoading:boolean = false;
  userList: User[];
  @ViewChild('dt') table: Table;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private userServices: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private administratorService: AdministratorService
    ) {
    this.breadcrumbService.setItems([
      { label: 'Listar usuario administrador' },
  ]);
   }

  ngOnInit(): void {
    this.getUser();
  }
  getUser(){
    this.userServices.listAdministratorUser().subscribe((resp:any)=>{
      this.isLoading = true;
      this.uselrAdminList=resp;
  });
  }
  disable(event: Event,id:number) {
    this.confirmationService.confirm({
        key: 'confirm2',
        target: event.target,
        message: '¿Esta seguro que desea deshabilitar usuario?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.administratorService.updateAdministratorUser(id,0).subscribe((user:any) => {
            this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Deshabilitado con éxito'});
            setTimeout(()=>{
              this.getUser();
            },600)
          })
        },
    });
  }
  enable(event: Event,id:number) {
    this.confirmationService.confirm({
        key: 'confirm1',
        target: event.target,
        message: '¿Esta seguro que desea habilitar usuario?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.administratorService.updateAdministratorUser(id,1).subscribe((user:any) => {
            //console.log(user);
            this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Habilitado con éxito'});
            setTimeout(()=>{
              this.getUser();
            },600)
          })
        },
    });
  }

}
