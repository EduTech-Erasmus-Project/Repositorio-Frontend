import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { LearningObjects } from "../../models/evaluation.models";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { Subscription } from "rxjs";
import Swal from "sweetalert2";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";

@Component({
  selector: "app-learning-object-pending-list",
  templateUrl: "./learning-object-pending-list.component.html",
  styleUrls: ["./learning-object-pending-list.component.scss"],
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
export class LearningObjectPendingListComponent implements OnInit, OnDestroy {
  learningobjectList: any[] = [];
  isLoading: boolean = false;
  learningobjectsSelected: LearningObjects[];
  @ViewChild("dt") table: Table;
  private suscriptions: Subscription[] = [];

  public rows: number = 0;
  public totalRecords: number = 0;
  public pageSize: number = 0;
  public page_now: number = 0;
  private next_event: string = "";
  private previus_event: string = "";

  public form: FormGroup;
  private date: Date = new Date();

  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    public appMain: AdminComponent,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private learningobjectService: LearningObjectService,
    private fb: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _router: Router
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Objetos de aprendizaje por aprobar",
        routerLink: ["/admin/learning-object/pending"],
      },
    ]);

    this.form = this.fb.group({
      created_init: [
        this._activeRoute.snapshot.queryParams?.created_init ||
          new Date(this.date.getFullYear(), this.date.getMonth(), 1),
        Validators.required,
      ],
      created_end: [
        this._activeRoute.snapshot.queryParams?.created_end || new Date(),
        Validators.required,
      ],
      general_title: [null],
      page: [this._activeRoute.snapshot.queryParams?.page || this.page_now + 1],
    });
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((res) => res.unsubscribe());
  }

  ngOnInit(): void {
    this.listLearningObject();
  }

  listLearningObject() {
    let data = {
      created_init: moment(this.form.value?.created_init).format("YYYY-MM-DD"),
      created_end: moment(this.form.value?.created_end)
        .add(1, "days")
        .format("YYYY-MM-DD"),
      general_title__icontains: this.form.value?.general_title || "",
      page: this.form.value?.page,
    };
    this.isLoading = false;
    this.administratorService.listLearningObject(0, data).subscribe(
      (resp: any) => {
        this.isLoading = true;
        this.learningobjectList = resp.results;

        this.totalRecords = resp.count;
        this.rows = resp.results.length;
        this.pageSize = resp.pages - 1;
        this.next_event = resp.links.next;
        this.previus_event = resp.links.previous;
      },
      (error) => {
        this.isLoading = true;
        this.learningobjectList = [];
      }
    );
    this.updateUrl();
  }
  click() {
    this.router.navigateByUrl("/admin/learning-object");
  }

  confirm2(event: Event, oaId: number) {
    this.confirmationService.confirm({
      key: "confirm2",
      target: event.target,
      message: "¿Esta seguro que desea aprobar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.administratorService
          .updatePublicandPrivateLearningObject(oaId, 1)
          .subscribe((resp: any) => {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Aprobado con éxito",
            });
            setTimeout(() => {
              this.listLearningObject();
            }, 600);
          });
      },
    });
  }
  getDetail(slug: string) {
    this.router.navigate([`/admin/learning-object/pending/detail/${slug}`]);
  }

  /**
   * funcion para eliminar el objeto de aprendizaje
   *  @method deleteLearningObject
   * */
  deleteLearningObject(oa_id: number) {
    // let oa_delete = this.learningobjectService.deleteObjestTeacherAdmin(oa_id).subscribe(
    //   (res:any)=>{
    //     if(res.code === 200){
    //         this.messageSuccess('Se elimino el Objeto de Apredinzaje correctamente');
    //         this.ngOnInit();
    //     }
    //   }
    // );

    // this.suscriptions.push(oa_delete);

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
            .deleteObjestTeacherAdmin(oa_id, data)
            .toPromise();

          this.ngOnInit();

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
  }

  /**
   * funcion para mostrar los mensajes de conformacion de eliminarcion de los objetos de aprendizaje
   * @method messageSuccess
   */
  private messageSuccess(message: string) {
    this.messageService.add({
      severity: "success",
      summary: "Exitoso",
      detail: message,
    });
  }

  /**
   * funcion para implementar la paginacion
   * @param event
   */
  async paginate(event) {
    //event.first = Index of the first record
    //event.rows = Number of rows to display in new page
    //event.page = Index of the new page
    //event.pageCount = Total number of pages

    const page_number: number = event.page + 1;
    this.form.controls["page"].setValue(page_number);

    //this.updateCurrentPage(this.page_now);
    // try {
    //   let search_page: any = await this.administratorService
    //     .listLearningObjectPagination(0, page_number)
    //     .toPromise();

    //   if (search_page) {
    //     if (search_page.results.length > 0) {
    //       this.learningobjectList = search_page.results;
    //       this.isLoading = true;
    //       this.next_event = search_page.links.next;
    //       this.previus_event = search_page.links.previous;
    //     }
    //     this.updateUrl();
    //   }
    // } catch (err) {
    //   this.isLoading = true;
    // }
    this.listLearningObject();
  }

  private updateUrl() {
    let urlTree = this._router.parseUrl(this._router.url);
    urlTree.queryParams["created_init"] = moment(
      this.form.get("created_init")?.value
    ).format("YYYY-MM-DD");
    urlTree.queryParams["created_end"] = moment(
      this.form.get("created_end")?.value
    ).format("YYYY-MM-DD");
    //urlTree.queryParams["page"] = this.form.get("page")?.value;
    this._router.navigateByUrl(urlTree);
  }

  getYearRange() {
    let date = new Date();
    return `${`${2020}:${date.getFullYear()}`}`;
  }
}
