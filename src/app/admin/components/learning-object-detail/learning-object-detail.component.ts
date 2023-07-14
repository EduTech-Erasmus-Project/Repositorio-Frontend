import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Table } from "primeng/table";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { ConfirmationService, MessageService } from "primeng/api";
import Swal from "sweetalert2";
import { LearningObjectService } from "src/app/services/learning-object.service";

@Component({
  selector: "app-learning-object-detail",
  templateUrl: "./learning-object-detail.component.html",
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
export class LearningObjectDetailComponent implements OnInit {
  @ViewChild("dt") table: Table;
  slug: string = "";
  type: string = "";
  learningobjectdetail: any = {};
  autor: any = {};
  index_url: string = null;
  statusUpdate: boolean = false;
  readMore: boolean = true;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private learningobjectService: LearningObjectService
  ) {
    this.slug = this.route.snapshot.params["slug"];
    this.type = this.route.snapshot.params["type"];
    this.breadcrumbService.setItems([
      this.type == "pending"
        ? {
            label: "Objetos de aprendizaje por aprobar",
            routerLink: ["/admin/learning-object/pending"],
          }
        : {
            label: "Objetos de aprendizaje aprobados",
            routerLink: ["/admin/learning-object/approved"],
          },
      { label: "Detalle" },
    ]);
  }

  ngOnInit() {
    this.getLearningObject();
  }
  onClick() {
    this.readMore = !this.readMore;
  }
  confirm2(event: Event) {
    this.confirmationService.confirm({
      key: "confirm2",
      target: event.target,
      message: "¿Esta seguro que desea aprobar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorService
          .updatePublicandPrivateLearningObject(
            this.learningobjectdetail["id"],
            1
          )
          .subscribe((resp: any) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Aprobado con éxito",
            });
            this.statusUpdate = true;
          });
      },
      // reject: () => {
      //     this.messageService.add({severity: 'error', summary: 'Rejected', detail: 'You have rejected'});
      // }
    });
  }

  getLearningObject() {
    this.administratorService.getLearningObject(this.slug).subscribe(
      (resp: any) => {
        this.learningobjectdetail = resp;
        this.autor = resp.user_created;
        this.index_url = resp.learning_object_file.url ?? "";
        this.statusUpdate = this.learningobjectdetail.public;
      },
      (err) => {
        let route =
          this.type == "pending"
            ? "/admin/learning-object/pending"
            : "/admin/learning-object/approved";
        this.router.navigate([route]);
      }
    );
  }

  public onDelete() {
    Swal.fire({
      title: "Escriba la razón de la eliminación del objeto de aprendizaje.",
      input: "textarea",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      showLoaderOnConfirm: true,
      preConfirm: async (message) => {
        let data = {
          message,
        };
        if (!message) {
          Swal.showValidationMessage(
            `Error: No se ah proporcionado una mensaje para el autor.`
          );
          return;
        }

        try {
          let oa_delete = await this.learningobjectService
            .deleteObjestTeacherAdmin(this.learningobjectdetail.id, data)
            .toPromise();

          let route =
            this.type == "pending"
              ? "/admin/learning-object/pending"
              : "/admin/learning-object/approved";
          this.router.navigate([route]);

          Swal.fire({
            icon: "success",
            title: "Se ah eliminado el objeto de aprendizaje.",
            showConfirmButton: true,
          });
        } catch (error) {
          console.log(error);
          Swal.showValidationMessage(
            `Error: ${error.error?.message || error.message}}`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
    // .then((result) => {
    //   if (result.isDenied) {
    //     Swal.fire({
    //       icon: "success",
    //       title: "Se ah rechazado el participante",
    //       showConfirmButton: false,
    //     });
    //   }
    // });
  }

  public onNotificate() {
    Swal.fire({
      title: "Escriba un mensaje para el autor.",
      input: "textarea",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      showLoaderOnConfirm: true,
      preConfirm: async (message) => {
        let data = {
          estado: false,
          message,
        };

        if (!message) {
          Swal.showValidationMessage(
            `Error: No se ah proporcionado una mensaje para el autor.`
          );
          return;
        }

        try {
          // let result = await this.expertoService
          //   .aprobarEvaluador(data)
          //   .toPromise();

          //this.loadPendientes();
          //this.expertoService.emitEvent(true);
          //console.log(result);

          Swal.fire({
            icon: "success",
            title: "Se ah rechazado el participante",
            showConfirmButton: true,
          });
        } catch (error) {
          console.log(error);
          Swal.showValidationMessage(
            `Error: ${error.error?.message || error.message}}`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
    // .then((result) => {
    //   if (result.isDenied) {
    //     Swal.fire({
    //       icon: "success",
    //       title: "Se ah rechazado el participante",
    //       showConfirmButton: false,
    //     });
    //   }
    // });
  }
}
