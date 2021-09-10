import { Component, OnInit } from '@angular/core';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { AdminComponent } from '../../admin.component';
import { User } from '../../models/evaluation.models';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }

`],
})

export class StudentComponent implements OnInit {
  listStudent:any=[];
  isLoading:boolean = false;
  userList: User[];
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService:AdministratorService,
    public appMain: AdminComponent,
  ) { 
    this.breadcrumbService.setItems([
      { label: 'Estudiantes' },
  ]);
  }

  ngOnInit(): void {
    this.getStudentList();
  }
  getStudentList(){
    this.administratorService.getStudentList().subscribe((user:any) => {
      this.isLoading = true;
      this.listStudent=user;
    })
  }
}
