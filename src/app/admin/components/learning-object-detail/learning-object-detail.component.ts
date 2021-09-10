import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component({
  selector: 'app-learning-object-detail',
  templateUrl: './learning-object-detail.component.html',
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }

`],
providers: [MessageService, ConfirmationService]
})
export class LearningObjectDetailComponent implements OnInit {

  @ViewChild('dt') table: Table;
  slug: string = "";
  type: string = "";
  learningobjectdetail:any={};
  autor:any={};
  index_url:string = null;
  statusUpdate:boolean = false;
  readMore:boolean = true;

  constructor(
      private breadcrumbService: BreadcrumbService,
      private administratorService: AdministratorService,
      private router: ActivatedRoute,
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
  ) {
      this.slug = this.router.snapshot.params['slug'];
      this.type = this.router.snapshot.params['type'];
      this.breadcrumbService.setItems([

          this.type == 'pending'?
          { label: 'Objetos de aprendizaje por aprobar',routerLink: ['/admin/learning-object/pending'] }:
          { label: 'Objetos de aprendizaje aprobados', routerLink: ['/admin/learning-object/approved'] },
          { label: 'Detalle'}
      ]);
  }

  ngOnInit() {
      this.getLearningObject();
  }
  onClick(){
      this.readMore = !this.readMore
  }
  confirm2(event: Event) {
      this.confirmationService.confirm({
          key: 'confirm2',
          target: event.target,
          message: '¿Esta seguro que desea aprobar?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.administratorService.updatePublicandPrivateLearningObject(this.learningobjectdetail['id'], 1).subscribe((resp:any)=>{
                  this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Aprobado con éxito'});
                  this.statusUpdate=true;
              })
          },
          // reject: () => {
          //     this.messageService.add({severity: 'error', summary: 'Rejected', detail: 'You have rejected'});
          // }
      });
    }

  getLearningObject() {
      this.administratorService.getLearningObject(this.slug).subscribe((resp:any)=>{
          this.learningobjectdetail=resp;
          this.autor=resp.user_created;
          this.index_url=resp.learning_object_file.url??"";
          this.statusUpdate=this.learningobjectdetail.public
          //console.log(resp)
      })
  }

}

