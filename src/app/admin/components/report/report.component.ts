import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { UserService } from "../../services/user.service";
import * as moment from "moment";
import { AddressService } from "../../services/address.service";
import { University } from "src/app/core/interfaces/university";
import { Campus } from "src/app/core/interfaces/campus";
import * as fileSaver from "file-saver";
import * as XLSX from "xlsx";
import { City } from "src/app/core/interfaces/city";
import { forkJoin } from "rxjs";
const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";
@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
})
export class ReportComponent implements OnInit {
  public form: FormGroup;
  private date: Date = new Date();

  public cities: City[];
  public universities?: University[];
  public campus?: Campus[];

  public loader: boolean = false;

  public data?: any[];

  public types: any[] = [
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
    private _router: Router,
    private _userService: UserService,
    private _addressService: AddressService
  ) {
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
      query: [null],
      upload: ["all"],
      university: [null],
      campus: [null],
      city: [null],
    });
  }
  ngOnInit(): void {
    this.loadData();
  }

  private async loadData() {
    try {
      let [cities, universities, campus]: any = await forkJoin([
        this._addressService.getCitiesActive(),
        this._addressService.getUniversitiesActive(),
        this._addressService.getCampusActive(),
      ]).toPromise();

      this.cities = cities;
      this.universities = universities;
      this.campus = campus;

      // let resp: any = await this._addressService
      //   .getCitiesActive()
      //   .toPromise();
      //this.cities = resp;
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.error?.message || error.message,
      });
    }
  }

  public async listLearningObject() {
    if (this.form.invalid) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Complete el formulario.",
      });
      return;
    }
    try {
      this.loader = true;
      let params = {
        created_init: moment(this.form.value?.created_init).format(
          "YYYY-MM-DD"
        ),
        created_end: moment(this.form.value?.created_end)
          .add(1, "days")
          .format("YYYY-MM-DD"),
        query: this.form.value?.query || "",
        upload: this.form.value?.upload,
        city: this.form.value?.city,
        university: this.form.value?.university,
        campus: this.form.value?.campus,
      };

      // if (params.query && params.query != "") {
      //   delete params.university;
      //   delete params.campus;
      // } else {
      //   if (!params.university || !params.campus) {
      //     Swal.fire({
      //       icon: "error",
      //       title: "Oops...",
      //       text: "Seleccione la Universidad y la Sede",
      //     });
      //     return;
      //   }
      // }

      let resp: any = await this._userService
        .getReportUsers(params)
        .toPromise();
      this.data = resp;
      this.loader = false;
    } catch (error: any) {
      console.log(error);
      this.loader = false;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.error?.message || error.message,
      });
    }
  }

  // public async onChangeCity() {
  //   try {
  //     let resp: any = await this._addressService
  //       .getUniversitiesByCityActive(
  //         Number(this.form.get("city")?.value)
  //       )
  //       .toPromise();
  //     this.universities = resp;
  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Oops...",
  //       text: error.error?.message || error.message,
  //     });
  //   }
  // }

  // public async onChangeUniversity() {
  //   try {
  //     let resp: any = await this._addressService
  //       .getCampusByUniversityActive(
  //         Number(this.form.get("university")?.value)
  //       )
  //       .toPromise();
  //     this.campus = resp;
  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Oops...",
  //       text: error.error?.message || error.message,
  //     });
  //   }
  // }

  getYearRange() {
    let date = new Date();
    return `${`${2020}:${date.getFullYear()}`}`;
  }

  public generateXls() {
    //let data = this.data;
    let data = this.data.map((user: any) => {
      if (user.learning_objects.length > 0) {
        return user.learning_objects.map((object: any) => {
          return {
            Nombre: user.first_name,
            Apellido: user.last_name,
            Email: user.email,
            Pais: user.country?.name,
            Provincia: user.province?.name,
            Ciudad: user.city?.name,
            Universidad: user.university?.name,
            Campus: user.campus?.name,
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
        Ciudad: user.city?.name,
        Universidad: user.university?.name,
        Campus: user.campus?.name,
        OA: "",
        URL: "",
      };
    });

    data = data.reduce(
      (acumulador, subArray) => acumulador.concat(subArray),
      []
    );
    //console.log("export data", data);
    this.exportAsExcelFile(data, "reporte");
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    fileSaver.saveAs(
      data,
      fileName + "_" + new Date().getTime() + EXCEL_EXTENSION
    );
  }
}
