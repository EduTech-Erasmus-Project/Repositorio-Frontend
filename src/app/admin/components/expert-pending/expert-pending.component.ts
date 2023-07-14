import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Table } from "primeng/table";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { ConfirmationService, MessageService } from "primeng/api";
import { User } from "../../models/evaluation.models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-expert-pending",
  templateUrl: "./expert-pending.component.html",
  styleUrls: ["./expert-pending.component.scss"],
  styles: [
    `
      @media screen and (max-width: 960px) {
        :host
          ::ng-deep
          .p-datatable.p-datatable-customers.rowexpand-table
          .p-datatable-tbody
          > tr
          > td:nth-child(6) {
          display: flex;
        }
      }
    `,
  ],
  providers: [MessageService, ConfirmationService],
})
export class ExpertPendingComponent implements OnInit {
  @ViewChild("dt") table: Table;
  user_student_teacher_list: any[] = [];
  userList: User[];
  isLoading: boolean = false;
  private subscriptions: Subscription[] = [];
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    public appMain: AdminComponent,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Docentes y expertos por aprobar",
        routerLink: ["/admin/teacher/request/pending"],
      },
    ]);
  }

  ngOnInit(): void {
    this.get_Expert();
  }

  async get_Expert() {
    let users_expert = await this.administratorService
      .getExpertToAprove()
      .toPromise();
    this.isLoading = true;
    this.user_student_teacher_list = users_expert;
  }

  getProfile(id: number) {
    this.router.navigate([
      `/admin/teacher/request/pending/teacher-expert-profile/${id}/pending`,
    ]);
  }
  confirm2(
    event: Event,
    id: number,
    teacher_status: number,
    expert_status: number
  ) {
    this.confirmationService.confirm({
      key: "confirm2",
      target: event.target,
      message: "¿Esta seguro que desea habilitar usuario?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorService
          .updateCollaboratingExpertToAprove(id, teacher_status, expert_status)
          .subscribe((user: any) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Habilitado con éxito",
            });
            setTimeout(() => {
              this.get_Expert();
            }, 600);
          });
      },
    });
  }

  /**
   * Funcion para eliminar el experto colaborador
   * @method deleteUserCollaborating
   */
  public deleteUserCollaborating(event: any, idUser: number) {
    this.confirmationService.confirm({
      key: "deleteUserExpert",
      target: event.target,
      message: "¿Esta seguro que desea eliminar el usuario?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorService
          .deleteUserExpert(idUser)
          .subscribe((user: any) => {
            if (user.code == 200) {
              this.ngOnInit();
              this.messageService.add({
                severity: "info",
                summary: "Confirmed",
                detail: "Usuario eliminado con éxito",
              });
            } else {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Error al eliminar un registro",
              });
            }
            setTimeout(() => {
              this.get_Expert();
            }, 600);
          });
      },
    });
  }
}
