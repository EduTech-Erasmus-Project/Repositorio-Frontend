
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { SearchService } from "../../../../../services/search.service";
import { LoginService } from "../../../../../services/login.service";
import { Subscription } from "rxjs";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
} from "@angular/forms";
import { SelectItemGroup, MessageService, Message } from "primeng/api";
import { UserGeneral } from "../../../../../core/models/userGeneral";

import * as moment from "moment";
import Swal from "sweetalert2";
import { UserService } from "../../../../../services/user.service";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AddressService } from "src/app/admin/services/address.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild("dropDowProfession") private dropDowProfession: ElementRef;
  @ViewChild("inputFile") inputFile: ElementRef;
  private subscribes: Subscription[] = [];
  public user: UserGeneral;
  public profesions: any[];

  public cities: any[];
  public universities: any[];
  public campusArray: any[];

  public levelsEdications: any[];
  public preferenceAreas: SelectItemGroup[];
  public areasInterestings_data_save: any[] = [];
  public areasInterestings: any[];
  public angForm: UntypedFormGroup;
  public flagN: number = 20;
  public fileImage: File;
  public urlImageLocal: any;
  public imageSatusErr: boolean = false;
  public imageUpload: boolean = false;
  public preferenceAreasSave: any[] = [];

  public validateRole: boolean = false;
  public validateEmail: boolean = false;
  public blockEmail: boolean = false;

  public msgs1: Message[];
  public patternV: string =
    "^([a-zA-Z0-9_' - '.]+)@([a-zA-Z0-9_' - '.]+).([a-zA-Z]{2,5})$";
  public localization = {
    buttonLabel: "Elige fecha",
    placeholder: "yyyy-mm-dd",
    selectedDateMessage: "La fecha seleccionada es",
    prevMonthLabel: "Mes anterior",
    nextMonthLabel: "Próximo mes",
    monthSelectLabel: "Mes",
    yearSelectLabel: "Año",
    closeLabel: "Cerrar ventana de fecha",
    calendarHeading: "Elige una fecha",
    dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    monthNamesShort: ["En", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    locale: "es-ES",
  }
  constructor(
    private searchService: SearchService,
    private loginService: LoginService,
    private userService: UserService,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
    private _addressService: AddressService
  ) {
    this.add_breadcrumb();
  }
  ngOnDestroy(): void {
    this.subscribes.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await this.languageService.translate.get('menu.settings').toPromise() },
      { label: await this.languageService.translate.get('menu.sideMenu.myAccount').toPromise(), routerLink: ["/settings/profile"] },
    ]);
  }

  async loadData() {

    let userSub = await this.userService
      .getUserDetail(this.loginService.user.id)
      .subscribe((res) => {
        this.user = res;
        this.createForm();
        this.loadDataAddress();
        this.angForm.controls['email'].disable();
      });

    //extraemos datos de profesions
    let profesionSub = await this.searchService
      .getProfession()
      .subscribe((res) => {
        this.profesions = res.map((item) => {
          return { id: item.id, name: item.description };
        });
        this.profesions = this.profesions;
      });

    //extraemos datos de nivel de educacion
    let levelSub = await this.searchService
      .getLevelEducation()
      .subscribe((res) => {
        this.levelsEdications = res.values.map((item: any) => {
          return { id: item.id, name: item.name };
        });
        this.levelsEdications = this.levelsEdications;
      });

    //Extraemos los datos de precerencias por area
    let preferencesSub = await this.searchService
      .getPreferencesArea()
      .subscribe((res) => {
        this.preferenceAreas = res.map((item: any) => {
          return {
            value: item.id,
            label: item.preferences_are,
            items: item.preferences.map((item: any) => {
              return { value: item.id, label: item.description };
            }),
          };
        });
        this.preferenceAreas = this.preferenceAreas;
      });

    let interestingsSub = await this.searchService
      .getInterestAreas()
      .subscribe((res) => {
        this.areasInterestings = res.values.map((item: any) => {
          return { id: item.id, name: item.name };
        });
        this.areasInterestings = this.areasInterestings;
      });



    this.subscribes.push(
      userSub,
      profesionSub,
      levelSub,
      preferencesSub,
      interestingsSub,
    );

  }

  private async loadDataAddress() {
    let citiesSub = await this._addressService.getCitiesActive().subscribe(
      (res: any) => {
        this.cities = res;
      },
      (error) => {
        console.log(error);
      }
    );

    try {
      let res: any = await this._addressService
        .getUniversitiesByCityActive(this.user.city.id)
        .toPromise();
      this.universities = res;
    } catch (e) {
      console.log(e);
    }

    try {
      this.campusArray = [];
      let res: any = await this._addressService
        .getCampusByUniversityActive(this.user.university.id)
        .toPromise();
      this.campusArray = res;
    } catch (error) {
      console.log(error);
    }

    this.subscribes.push(citiesSub);
  }

  onSubmit() { }

  createForm() {
    this.angForm = this.fb.group({
      name: [
        this.user.first_name,
        [
          Validators.required,
          Validators.pattern("[a-zA-ZñÑáéíóúÁÉÍÓÚs ]+"),
          Validators.maxLength(20),
          Validators.minLength(3),
        ],
      ],
      lastname: [
        this.user.last_name,
        [
          Validators.required,
          Validators.pattern("[a-zA-ZñÑáéíóúÁÉÍÓÚs ]+"),
          Validators.maxLength(20),
          Validators.minLength(3),
        ],
      ],
      check: this.user.student || false,
      checkTe: this.user.teacher || false,
      checkEx: this.user.collaboratingExpert || false,

      email: [
        this.user.email,
        [
          Validators.required,
          //Validators.pattern(this.patternV),
          /*^[a-z]+(@)+[u]+[p]+[s]+.+[e]+[d]+[u]+.+[e]+[c]*/
        ],
      ],
    });

    //En el prefil no puedes editar el tipo miembro
    this.angForm.controls['check'].disable();
    this.angForm.controls['checkTe'].disable();
    this.angForm.controls['checkEx'].disable();

    if (this.checkEs) {
      this.addStudentControls();

    } else {
      this.removeStudentControls();
    }
    if (this.checkTe) {
      this.addProfesionControl();
      this.addCityControl();
      this.addUniversityControl();
      this.addCampusControl();
    } else {
      this.removeProfesionControl();
      this.removeCityControl();
      this.removeUniversityControl();
      this.removeCampusControl();
    }
    if (this.checkEx) {
      this.addExpertControls();
    } else {
      this.removeExpertControls();
    }
  }

  addStudentControls() {

    this.angForm.addControl(
      "calendar",
      new UntypedFormControl(
        this.user.student
          ? moment(this.user.student.birthday).format("YYYY-MM-DD")
          : null,
        [Validators.required]
      )
    );
    this.angForm.addControl(
      "educacionL",
      new UntypedFormControl(this.user.student ? this.getLevelsStudent() : null, [
        Validators.required,
      ])
    );
    this.angForm.addControl(
      "areasInteres",
      new UntypedFormControl(
        this.user.student ? this.getInterestAreasStudent() : null,
        [Validators.required]
      )
    );
    this.angForm.addControl(
      "areasPrefer",
      new UntypedFormControl(this.user.student ? this.getPreferencesStudent() : null, [
        Validators.required,
      ])
    );
    this.angForm.addControl(
      "disability",
      new UntypedFormControl(this.user.student?.has_disability ? "yes" : "no")
    );

    this.angForm.addControl(
      "typeDisability",
      new UntypedFormControl(
        this.user.student.disability_description
      )
    );
  }

  removeStudentControls() {
    this.angForm.removeControl("calendar");
    this.angForm.removeControl("educacionL");
    this.angForm.removeControl("areasInteres");
    this.angForm.removeControl("areasPrefer");
    this.angForm.removeControl("disability");
  }

  getLevelsStudent() {
    return this.user.student.education_levels.map((item: any) => {
      return item.id;
    });
  }

  getInterestAreasStudent() {
    this.areasInterestings_data_save = this.user.student.knowledge_areas.map((item: any) => item.id);
    return this.areasInterestings_data_save;
  }

  getPreferencesStudent() {
    this.preferenceAreasSave = this.user.student.preferences.map(
      (item: any) => item.id
    );
    return this.preferenceAreasSave;
  }

  getProfesionTeacher() {
    return this.user.teacher.professions.map((item) => {
      return { id: item.id, name: item.description };
    });
  }

  addTypeDisability() {

  }

  removeTypeDisability() {
    this.angForm.controls["typeDisability"].setValue(null);
  }

  addProfesionControl() {
    this.angForm.addControl(
      "profession",
      new UntypedFormControl(
        this.user.teacher ? this.getProfesionTeacher() : null,
        Validators.required
      )
    );
  }

  addCityControl() {
    this.angForm.addControl(
      "city",
      new UntypedFormControl(
        this.user.teacher ? this.user.city.id : null,
        Validators.required
      )
    );
  }

  addUniversityControl() {
    this.angForm.addControl(
      "university",
      new UntypedFormControl(
        this.user.teacher ? this.user.university.id : null,
        Validators.required
      )
    );
  }

  addCampusControl() {
    this.angForm.addControl(
      "campus",
      new UntypedFormControl(
        this.user.teacher ? this.user.campus.id : null,
        Validators.required
      )
    );
  }

  removeProfesionControl() {
    try {
      this.dropDowProfession.nativeElement.remove();
      this.angForm.removeControl("profession");
    } catch (error) { }
  }

  removeCityControl() {
    try {
      this.dropDowProfession.nativeElement.remove();
      this.angForm.removeControl("city");
    } catch (error) { }
  }

  removeUniversityControl() {
    try {
      this.dropDowProfession.nativeElement.remove();
      this.angForm.removeControl("university");
    } catch (error) { }
  }
  removeCampusControl() {
    try {
      this.dropDowProfession.nativeElement.remove();
      this.angForm.removeControl("campus");
    } catch (error) { }
  }
  addExpertControls() {
    this.angForm.addControl(
      "levelExpertF",
      new UntypedFormControl(
        this.user.collaboratingExpert?.expert_level || "Bajo",
        Validators.required
      )
    );
    this.angForm.addControl(
      "url",
      new UntypedFormControl(this.user.collaboratingExpert?.web || null, [
        // Validators.required,
        // Validators.pattern(
        //   '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
        // ),
      ])
    );
    this.angForm.addControl(
      "academic",
      new UntypedFormControl(this.user.collaboratingExpert?.academic_profile || null, [
        //Validators.required,
        Validators.pattern("[a-zA-ZñÑáéíóúÁÉÍÓÚs ]+"),
      ])
    );
  }

  async removeExpertControls() {
    await this.angForm.removeControl("levelExpertF");
    await this.angForm.removeControl("url");
    await this.angForm.removeControl("academic");
  }

  validarCamp(event): boolean {
    if (this.angForm.get("name").hasError("pattern")) {
      return true;
    }
    return false;
  }
  getErrorNumber(field: string): number {
    if (this.angForm.get(field).hasError("pattern")) {
      return (this.flagN = 0);
    }
    return (this.flagN = 20);
  }
  getvals(field: any): boolean {
    return this.angForm.get(field).pristine;
  }

  get checkEs() {
    return this.angForm.controls.check.value;
  }
  get checkTe() {
    return this.angForm.controls.checkTe.value;
  }
  get checkEx() {
    return this.angForm.controls.checkEx.value;
  }
  get disability() {
    if (this.angForm.controls.disability.value === "yes") {
      return true;
    }
    return false;
  }
  get name() {
    return this.angForm.get("name");
  }
  get lastname() {
    return this.angForm.get("lastname");
  }
  get email() {
    return this.angForm.get("email");
  }
  get password() {
    return this.angForm.get("password");
  }
  get typeDisability() {
    return this.angForm.get("typeDisability");
  }
  get levelExpertF() {
    return this.angForm.get("levelExpertF");
  }
  get url() {
    return this.angForm.get("url");
  }
  get academic() {
    return this.angForm.get("academic");
  }
  get calendar() {
    return this.angForm.get("calendar");
  }
  get educacionL() {
    return this.angForm.get("educacionL");
  }
  get areasInteres() {
    return this.angForm.get("areasInteres");
  }
  get areasPrefer() {
    return this.angForm.get("areasPrefer");
  }
  get profession() {
    return this.angForm.get("profession");
  }
  get city() {
    return this.angForm.get("city");
  }
  get university() {
    return this.angForm.get("university");
  }
  get campus() {
    return this.angForm.get("campus");
  }
  get terms() {
    return this.angForm.get("terms");
  }
  markTouchForm() {
    (<any>Object).values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  onChangeTypeStudentEnter(evt) {
    if (this.checkEs) {
      this.addStudentControls();
      this.validateRole = false;
    } else {
      this.removeStudentControls();
    }
  }


  onChangeTypeTeacher(evt) {
    if (this.checkTe) {
      this.addProfesionControl();
      this.validateRole = false;
    } else {
      this.removeProfesionControl();
    }
  }

  onChangeTypeExpert(evt) {
    if (this.checkEx) {
      this.addExpertControls();
      this.validateRole = false;
    } else {
      this.removeExpertControls();
    }
  }

  onChangeDisability() {
    if (!this.disability) {
      this.angForm.controls["typeDisability"].setValue('Ninguna');
      this.angForm.controls["typeDisability"].clearValidators();
      this.angForm.controls["typeDisability"].updateValueAndValidity();
    } else {
      this.angForm.controls["typeDisability"].setValue((this.angForm.get("typeDisability").value == null) ? this.user.disability_description : null);
      this.angForm.controls["typeDisability"].setValidators([Validators.required]);
      this.angForm.controls["typeDisability"].updateValueAndValidity();
    }
  }

  async validateUser() {

    if (this.checkTe || this.checkEx || this.checkEs) {
      if (this.angForm.valid) {
        this.validateRole = false;
        Swal.fire({
          allowOutsideClick: false,
          icon: "info",
          text: "Registrando...",
        });
        Swal.showLoading(null);

        this.getDataMaped();
        await this.userService.updateUser(this.user).subscribe(
          (res) => {
            this.showSuccess("Los datos se han actualizado con éxito");
            this.loginService.currentUser = this.user;
            Swal.close();
            this.validateEmail = false;
            //console.log('res',res)
          },
          (err) => {
            //console.log("register err (Act)", err); //validateEmail
            console.log(err)
            if (err.error.message == "Debe tener un email institucional") {
              if (this.roleUser) {
                this.showError(
                  "No puedes ser Docente o Experto Colaborador por que debes estar registrado con un correo institucional"
                );
              } else {
                this.showError("El correo electronico debe ser institucional");
                this.validateEmail = true;
              }
            } else if (err.error.message == "This field must be unique.") {
              this.showError(
                "El correo que ingreso ya se encuentra registrado"
              );
            }
            Swal.close();
          }
        );

        //this.subscribes.push(registerSub);
      } else {
        this.markTouchForm();
        this.showError("Formulario invalido");
      }
    } else {
      this.validateRole = true;
      this.markTouchForm();
    }
  }

  showError(message) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  }
  showSuccess(message) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: message,
    });
  }

  selectPreferences(evt) {
    if (this.preferenceAreasSave.includes(evt)) {
      this.preferenceAreasSave = this.preferenceAreasSave.filter(
        (res) => res != evt
      );
      //console.log("Se elimina",this.preferenceAreasSave);
    } else {
      this.preferenceAreasSave.push(evt);
      //console.log("Aki viene", this.preferenceAreasSave)
    }
    this.angForm.patchValue({
      areasPrefer: this.preferenceAreasSave,
    });
  }

  getDataMaped() {
    this.user.roles = [];
    if (this.checkEs) {
      this.user.roles.push("student");
    }
    if (this.checkTe) {
      this.user.roles.push("teacher");
    }
    if (this.checkEx) {
      this.user.roles.push("expert");
    }
    this.user.first_name = this.angForm.value.name;
    this.user.last_name = this.angForm.value.lastname;
    this.user.email = this.angForm.value.email;
    this.user.password = this.angForm.value.password;

    if (this.checkEs) {
      this.user.education_levels = this.angForm.value.educacionL;
      this.user.knowledge_areas = this.angForm.value.areasInteres;
      this.user.preferences = this.angForm.value.areasPrefer;

      this.user.has_disability = this.angForm.value.disability;
      this.user.disability_description = this.angForm.value.typeDisability;
      this.user.birthday = moment(this.angForm.value.calendar).format(
        "YYYY-MM-DD"
      );
    }

    if (this.checkTe) {
      this.user.professions = [this.angForm.value.profession[0]?.id];
      this.user.city = this.angForm.value.city;
      this.user.university = this.angForm.value.university;
      this.user.campus = this.angForm.value.campus;
    }
    if (this.checkEx) {
      this.user.expert_level = this.angForm.value.levelExpertF;
      this.user.collaboratingExpert.expert_level = this.angForm.value.levelExpertF;

      if (this.angForm.value.url != "") {
        if (this.angForm.value.url != null) {
          this.user.web = this.angForm.value.url;
        } else {
          this.user.web = this.angForm.value.url;
        }
      }

      if (this.angForm.value.academic != "") {
        if (this.angForm.value.url != null) {
          this.user.academic_profile = this.angForm.value.academic;
        } else {
          this.user.academic_profile = this.angForm.value.academic;
        }
      }

    }
  }
  getYearRange() {
    let date = new Date();
    return `${`${date.getFullYear() - 140}:${date.getFullYear() - 5}`}`;
  }

  selectLevels(evt) {
    this.angForm.patchValue({
      educacionL: [Number(evt.target.value)]
    });
  }

  selectAreas(evt) {
    if (this.areasInterestings_data_save.includes(evt)) {
      this.areasInterestings_data_save = this.areasInterestings_data_save.filter(
        (res) => res != evt
      );
    } else {
      this.areasInterestings_data_save.push(evt);
    }

    this.angForm.patchValue({
      areasInteres: this.areasInterestings_data_save,
    });
  }

  selectProfesion(evt) {
    this.angForm.patchValue({
      profession: Number(evt.target.value),
    });
  }

  onChangePicture(event: any) {
    this.fileImage = event.target.files[0];
    var reader = new FileReader();

    reader.onload = (event: any) => {
      this.urlImageLocal = event.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  onCancelImage() {
    this.fileImage = null;
    this.urlImageLocal = null;
    this.imageSatusErr = false;
  }
  async onLoadImage() {
    this.imageUpload = true;
    await this.userService.updateImage(this.fileImage, this.user.id).subscribe(
      (res: any) => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "La foto de perfil se ah cambiado con éxito",
        });
        this.user.image = res.image;
        this.loginService.currentUser = this.user;

        this.imageSatusErr = false;
        this.imageUpload = false;
        this.fileImage = null;
        this.urlImageLocal = null;
      },
      (err) => {
        this.imageSatusErr = true;
        this.imageUpload = false;
      }
    );
  }

  get roleUser() {
    return this.loginService.validateRole("student");
  }

  onEnterFigure() {
    this.inputFile.nativeElement.click();
  }

  event_get_data_calendar(event) {
    this.angForm.controls['calendar'].setValue(
      event.detail.value
    );
  }

  async onChangeCity(evt) {
    //console.log("onChangeCity", evt.target.value);
    try {
      this.angForm.controls["city"].setValue(Number(evt.target.value || 0));
      this.universities = [];
      let res: any = await this._addressService
        .getUniversitiesByCityActive(evt.target.value)
        .toPromise();
      //console.log(res);
      this.universities = res;
    } catch (error) {
      console.log(error);
    }
  }

  async onChangeUniversity(evt) {
    //console.log("onChangeCity", evt.target.value);
    try {
      this.angForm.controls["university"].setValue(
        Number(evt.target.value || 0)
      );
      this.campusArray = [];
      let res: any = await this._addressService
        .getCampusByUniversityActive(evt.target.value)
        .toPromise();
      //console.log(res);
      this.campusArray = res;
    } catch (error) {
      console.log(error);
    }
  }

  async onChangeCampus(evt) {
    //console.log("onChangeCity", evt.target.value);
    this.angForm.controls["campus"].setValue(Number(evt.target?.value || 0));
  }

}
