import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Params } from "@angular/router";
import Swal from "sweetalert2";
import { getHttpErrorMessage } from "src/app/core/utils/http-error.utils";
import { UserService } from "../../services/user.service";
import * as moment from "moment";
import { AddressService } from "../../services/address.service";
import { University } from "src/app/core/interfaces/university";
import { Campus } from "src/app/core/interfaces/campus";
import * as XLSX from "xlsx";
import { City } from "src/app/core/interfaces/city";
import { firstValueFrom, forkJoin } from "rxjs";
import { ApiPaginatedResponse, ManagedUserSummary, ReportFilterParams } from "src/app/core/interfaces/api-contracts";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { buildTimestampedFileName, downloadBlob } from "src/app/core/utils/file.utils";
const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";

type UploadFilterValue = "all" | "upload" | "not_upload";

interface ReportFormControls {
  created_init: FormControl<string | null>;
  created_end: FormControl<string | null>;
  query: FormControl<string | null>;
  upload: FormControl<UploadFilterValue>;
  university: FormControl<number | null>;
  campus: FormControl<number | null>;
  city: FormControl<number | null>;
}

interface NormalizedReportResponse {
  count: number;
  results: ManagedUserSummary[];
}

type ReportExportRow = Record<string, string | undefined>;

/**
 * Orquesta el reporte administrativo de usuarios, incluyendo filtros,
 * paginacion server-side y exportacion del resultado actual a Excel.
 */
@Component({
    selector: "app-report",
    templateUrl: "./report.component.html",
    styleUrls: ["./report.component.scss"],
    standalone: false
})
export class ReportComponent implements OnInit {
  public form: FormGroup<ReportFormControls>;

  public cities: City[] = [];
  public universities: University[] = [];
  public campus: Campus[] = [];

  public loader = false;
  public exporting = false;

  public data: ManagedUserSummary[] = [];
  public totalRecords = 0;
  public rows = 10;
  public first = 0;
  public currentPage = 1;
  public hasSearched = false;

  public types: Array<{ label: string; value: UploadFilterValue }> = [
    {
      label: "Todos",
      value: "all",
    },
    {
      label: "Subidos",
      value: "upload",
    },
    {
      label: "No Subidos",
      value: "not_upload",
    },
  ];

  constructor(
    private fb: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _userService: UserService,
    private _addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {
    const queryParams = this._activeRoute.snapshot.queryParams;

    this.form = this.fb.group({
      created_init: [
        this.getQueryParamValue(queryParams, "created_init"),
      ],
      created_end: [
        this.getQueryParamValue(queryParams, "created_end"),
      ],
      query: [null as string | null],
      upload: ["all" as UploadFilterValue],
      university: [null as number | null],
      campus: [null as number | null],
      city: [null as number | null],
    });
  }
  ngOnInit(): void {
    void this.loadData();
  }

  /**
   * Carga los catalogos base del formulario de filtros.
   */
  private async loadData() {
    try {
      const [cities, universities, campus] = await firstValueFrom(
        forkJoin([
        this._addressService.getCitiesActive(),
        this._addressService.getUniversitiesActive(),
        this._addressService.getCampusActive(),
        ])
      );

      this.cities = cities;
      this.universities = universities;
      this.campus = campus;
      this.refreshView();
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
      });
    }
  }

  /**
   * Ejecuta la busqueda principal usando el estado actual del formulario.
   */
  public async listLearningObject() {
    await this.loadReportPage(1, this.rows);
  }

  public async onPageChange(event: { rows?: number; first?: number }) {
    if (!this.hasSearched || this.loader) {
      return;
    }

    const rows = Number(event?.rows) || this.rows;
    const first = Number(event?.first) || 0;
    const page = Math.floor(first / rows) + 1;

    if (page === this.currentPage && rows === this.rows) {
      return;
    }

    await this.loadReportPage(page, rows);
  }

  /**
   * Resuelve una pagina del reporte y sincroniza el estado del paginador.
   */
  private async loadReportPage(page: number, pageSize: number) {
    if (this.loader) {
      return;
    }

    if (this.form.invalid) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Complete el formulario.",
      });
      return;
    }
    this.loader = true;

    try {
      const resp = await this.fetchReportPage(page, pageSize);
      this.data = resp.results;
      this.totalRecords = resp.count;
      this.rows = pageSize;
      this.currentPage = page;
      this.first = (page - 1) * pageSize;
      this.hasSearched = true;
      this.refreshView();
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
      });
    } finally {
      this.loader = false;
      this.refreshView();
    }
  }

  public generateXls() {
    if (!this.totalRecords || this.exporting) {
      Swal.fire({
        icon: "info",
        title: "Sin datos",
        text: "No hay resultados para exportar.",
      });
      return;
    }

    this.exportCurrentReport();
  }

  /**
   * Descarga el reporte completo usando paginacion incremental para no
   * depender solo de la pagina actualmente visible en pantalla.
   */
  private async exportCurrentReport() {
    this.exporting = true;

    try {
      const users = await this.fetchAllReportUsers();
      const data = this.mapUsersToExportRows(users).reduce<ReportExportRow[]>((rows, row) => {
        if (Array.isArray(row)) {
          rows.push(...row);
        } else {
          rows.push(row);
        }
        return rows;
      }, []);

      this.exportAsExcelFile(data, "reporte");
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: getHttpErrorMessage(error),
      });
    } finally {
      this.exporting = false;
      this.refreshView();
    }
  }

  private buildReportParams(page: number, pageSize: number): ReportFilterParams {
    const params: ReportFilterParams = {
      query: this.form.value?.query || "",
      upload: this.form.value?.upload,
      city: this.form.value?.city,
      university: this.form.value?.university,
      campus: this.form.value?.campus,
      page,
      page_size: pageSize,
    };

    if (this.form.value?.created_init) {
      params.created_init = moment(this.form.value.created_init).format("YYYY-MM-DD");
    }

    if (this.form.value?.created_end) {
      params.created_end = moment(this.form.value.created_end).add(1, "days").format("YYYY-MM-DD");
    }

    return params;
  }

  private async fetchReportPage(
    page: number,
    pageSize: number
  ): Promise<NormalizedReportResponse> {
    const params = this.buildReportParams(page, pageSize);
    const resp = await firstValueFrom(this._userService.getReportUsers(params));
    return this.normalizeReportResponse(resp);
  }

  private normalizeReportResponse(
    resp: ApiPaginatedResponse<ManagedUserSummary> | ManagedUserSummary[]
  ): NormalizedReportResponse {
    const normalizedResponse = normalizeCollectionResponse(resp);

    return {
      count: normalizedResponse.total,
      results: normalizedResponse.items,
    };
  }

  private async fetchAllReportUsers(): Promise<ManagedUserSummary[]> {
    const exportPageSize = 100;
    let page = 1;
    let users: ManagedUserSummary[] = [];
    let total = 0;

    do {
      const resp = await this.fetchReportPage(page, exportPageSize);
      users = users.concat(resp.results);
      total = resp.count;
      page += 1;
    } while (users.length < total && total > 0);

    return users;
  }

  public get resultsCountLabel(): number {
    return this.totalRecords || this.data.length;
  }

  public get currentRangeLabel(): string {
    if (!this.resultsCountLabel) {
      return "0";
    }

    return `${this.data.length} de ${this.resultsCountLabel}`;
  }

  public mapUsersToExportRows(users: ManagedUserSummary[]) {
    return users.map((user) => {
      if (user.learning_objects?.length > 0) {
        return user.learning_objects.map((object) => {
          return {
            Nombre: user.first_name,
            Apellido: user.last_name,
            Email: user.email,
            Pais: user.country?.name,
            Provincia: user.province?.name,
            Ciudad: this.getEntityName(user.city),
            Universidad: this.getEntityName(user.university),
            Campus: this.getEntityName(user.campus),
            OA: object.general_title,
            URL: object.learning_object_file.url,
          };
        });
      }

      return {
        Nombre: user.first_name,
        Apellido: user.last_name,
        Email: user.email,
        Pais: user.country?.name,
        Provincia: user.province?.name,
        Ciudad: this.getEntityName(user.city),
        Universidad: this.getEntityName(user.university),
        Campus: this.getEntityName(user.campus),
        OA: "",
        URL: "",
      };
    });
  }

  public exportAsExcelFile(
    json: ReportExportRow[],
    excelFileName: string
  ): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: ArrayBuffer, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    downloadBlob(data, buildTimestampedFileName(fileName, EXCEL_EXTENSION));
  }

  private getQueryParamValue(params: Params, key: string): string | null {
    const value = params?.[key];
    return typeof value === "string" && value.trim() ? value : null;
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null) {
      const errorRecord = error as {
        error?: { message?: string };
        message?: string;
      };
      return errorRecord.error?.message || errorRecord.message || "Error inesperado.";
    }

    return "Error inesperado.";
  }

  private getEntityName(
    value: number | { id?: number; name?: string } | null | undefined
  ): string | undefined {
    return typeof value === "object" ? value?.name : undefined;
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
