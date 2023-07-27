import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/admin/services/auth.service";
import Swal from "sweetalert2";
import { SelectItemGroup } from "primeng/api";
import { UserGeneral } from "src/app/core/models/userGeneral";
import { SearchService } from "src/app/services/search.service";
import { Subscription } from "rxjs";
import { MessageService } from "primeng/api";
import * as moment from "moment";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AddressService } from "src/app/admin/services/address.service";
import { City } from "src/app/core/interfaces/city";
import { University } from "src/app/core/interfaces/university";
import { Campus } from "src/app/core/interfaces/campus";
import { EmailExtension } from "src/app/core/interfaces/EmailExtension";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
})
export class SignUpComponent implements OnInit, OnDestroy {
  //@ViewChild("dropDowProfession") private dropDowProfession: ElementRef;

  //variables para activar los checkbox
  //dark: boolean = false;
  public flagprofession = false;
  public user: UserGeneral = new UserGeneral();
  public profesions: any[] = [];
  public levelsEdications: any[];
  public preferenceAreas: SelectItemGroup[];
  public areasInterestings: any[];
  public areasInterestings_data_save: any[] = [];
  public preferenceAreasSave: any[] = [];
  public selectedValues: string[] = [];
  public angForm: UntypedFormGroup;
  public show: boolean = false;
  public flagN: number = 20;
  private subscribes: Subscription[] = [];
  public validateRole: boolean = false;
  public validateEmail: boolean = false;
  public flagAlert: boolean = false;
  public registred: boolean = false;
  // public patternCorreo: string = `^([a-zA-Z0-9]+.+)@((?!hotmail|gmail|yahoo|outlook)(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$`;
  private typeRegister: string;
  public validateEmailPattern = false;
  public msgs: any[];
  public educacionLevel: any;
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
    dayNames: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ],
    monthNames: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    monthNamesShort: [
      "En",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    locale: "es-ES",
  };
  public message_check_email: boolean = false;
  public cities: City[];
  public universities: University[] = [];
  public campusArray: Campus[] = [];
  private emailsExtension: any[] = [];
  private typeRolOptionRegister: string = '';
  private typeOption: string = '';
  //private arrayDomain:any[]=[];

  constructor(
    private auth: AuthService,
    private fb: UntypedFormBuilder,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private _router: Router,
    private messageService: MessageService,
    private languageService: LanguageService,
    private breadcrumbService: BreadcrumbService,
    private _addressService: AddressService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.typeRegister = params.register;
    });
    this.validate_request(this.typeRegister);
    this.add_breadcrumb();

    this.add_item_default_array(this.universities);
    this.add_item_default_array(this.campusArray);
  }

  private validate_request(params: any) {
    let type_meber_accepted = ["expert", "student", "teacher"];
    if (!type_meber_accepted.includes(params)) {
      this._router.navigate(["/register"]);
    }
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.loadDataAsync();
    //new test();
    //this.getYearRange();
  }

  /**
   * Funcion asincrona para cargar los recuros
   * @method loadDataAsync
   */
  async loadDataAsync() {
    this.loadData();
    await this.createForm();
    //await this.loadDataEmailExtension();
  }

  private async loadDataEmailExtension() {
    let userType: any;
    try {
      let typeUser: any = await this.searchService.getTypeUserProfile().toPromise();
      if (typeUser.length > 0) {
        userType = typeUser.filter(res => res.description == this.typeRolOptionRegister);
        this.typeOption = userType[0].option_register.type_option;
        try {
          let emailEx: any = await this.searchService.getEmailExtension(userType[0].option_register.id, this.typeRolOptionRegister).toPromise();

          if (emailEx.code == 200) {
            this.emailsExtension = emailEx.data;
          }
        } catch (error) {

        }

      }
    } catch (error) {

    }


  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: await this.languageService.translate
          .get("menu.register")
          .toPromise(),
        routerLink: ["/register"],
      },
    ]);
  }

  createForm() {
    this.angForm = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.pattern("[a-zA-ZñÑáéíóúÁÉÍÓÚs ]+"),
          Validators.maxLength(50),
          Validators.minLength(3),
        ],
      ],
      lastname: [
        null,
        [
          Validators.required,
          Validators.pattern("[a-zA-ZñÑáéíóúÁÉÍÓÚs ]+"),
          Validators.maxLength(50),
          Validators.minLength(3),
        ],
      ],
      check: [this.typeRegister == "student"],
      checkTe: [this.typeRegister == "teacher"],
      checkEx: [this.typeRegister === "expert"],
      email: [
        null,
        [
          Validators.required,
          //Validators.pattern(this.patternCorreo),
          Validators.email,
          /*^[a-z]+(@)+[u]+[p]+[s]+.+[e]+[d]+[u]+.+[e]+[c]*/
        ],
      ],
      password: [
        null,
        [
          Validators.required,
          Validators.pattern(
            "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}"
          ),
        ],
      ],
      terms: [false, [Validators.required]],
    });

    if (this.checkEs) {
      this.addStudentControls();
      this.disable_Buttons_type_member("checkTe", "checkEx");
    } else {
      this.removeStudentControls();
    }
    if (this.checkTe) {
      this.disable_Buttons_type_member("check", "checkEx");
      this.addProfesionControl();
    } else {
      this.removeControlsTeacher();
    }
    if (this.checkEx) {
      this.addExpertControls();
      this.disable_Buttons_type_member("checkTe", "check");
    } else {
      this.removeExpertControls();
    }
  }

  /**
   * FUNCION PARA CREAR UN VALIDADOR PERSONALIZADO
   * @method validate_select_array_zero
   */
  public validate_select_array_zero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Number(control.value) == 0 && !control.value
        ? { first_item_default: true }
        : null;
    };
  }

  private disable_Buttons_type_member(type1: string, type2: string) {
    this.angForm.get(type1).disable();
    this.angForm.get(type2).disable();
  }

  getconditionParams(type: string): boolean {
    return this.typeRegister === type;
  }

  addStudentControls() {
    //console.log("create student controls");
    this.angForm.addControl(
      "calendar",
      new UntypedFormControl("2000-01-01", [Validators.required])
    );
    this.angForm.addControl(
      "educacionL",
      new UntypedFormControl(null, [Validators.required])
    );

    this.angForm.addControl(
      "areasInteres",
      new UntypedFormControl(null, [Validators.required])
    );
    this.angForm.addControl(
      "areasPrefer",
      new UntypedFormControl(null, [Validators.required])
    );
    this.angForm.addControl(
      "disability",
      new UntypedFormControl("no", [Validators.required])
    );
    this.angForm.addControl("typeDisability", new UntypedFormControl(null));
  }

  removeStudentControls() {
    this.angForm.removeControl("calendar");
    this.angForm.removeControl("educacionL");
    this.angForm.removeControl("areasInteres");
    this.angForm.removeControl("areasPrefer");
  }

  addTypeDisability() {
    this.angForm.addControl(
      "typeDisability",
      new UntypedFormControl(null, Validators.required)
    );
  }

  removeTypeDisability() {
    this.angForm.removeControl("typeDisability");
  }

  addProfesionControl() {
    let object_profession =
      this.profesions?.length == 0 ? 0 : this.profesions[0].id;

    //let city = this.cities?.length == 0 ? 0 : this.cities[0].id;
    //let university =
    // this.universities?.length == 0 ? 0 : this.universities[0].id;
    //let campus = this.campusArray?.length == 0 ? 0 : this.campusArray[0].id;

    this.angForm.addControl(
      "profession",
      new UntypedFormControl(object_profession, [
        Validators.required,
        this.validate_select_array_zero(),
      ])
    );
    this.angForm.addControl(
      "city",
      new UntypedFormControl(0, [
        Validators.required,
        this.validate_select_array_zero(),
      ])
    );
    this.angForm.addControl(
      "university",
      new UntypedFormControl(0, [
        Validators.required,
        this.validate_select_array_zero(),
      ])
    );
    this.angForm.addControl(
      "campus",
      new UntypedFormControl(0, [
        Validators.required,
        this.validate_select_array_zero(),
      ])
    );
    // this.removeEmail();
    //   this.addEmailPathTeacherAndExpert();
  }

  removeControlsTeacher() {
    try {
      //this.dropDowProfession.nativeElement.remove();
      this.angForm.removeControl("profession");
      this.angForm.removeControl("city");
      this.angForm.removeControl("university");
      this.angForm.removeControl("campus");
    } catch (error) {
      console.log(error);
    }
  }

  addExpertControls() {
    this.angForm.addControl(
      "levelExpertF",
      new UntypedFormControl("Bajo", Validators.required)
    );
    this.angForm.addControl(
      "url",
      new UntypedFormControl(null, [
        // Validators.pattern(
        //   '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
        // ),
      ])
    );
    this.angForm.addControl("academic", new UntypedFormControl(null));
    this.angForm.addControl(
      "city",
      new UntypedFormControl(0, [
        Validators.required,
        this.validate_select_array_zero(),
      ])
    );
    this.angForm.addControl(
      "university",
      new UntypedFormControl(0, [
        Validators.required,
        this.validate_select_array_zero(),
      ])
    );
    this.angForm.addControl(
      "campus",
      new UntypedFormControl(0, [
        Validators.required,
        this.validate_select_array_zero(),
      ])
    );
    //  this.removeEmail();
    //  this.addEmailPathTeacherAndExpert();
  }

  async removeExpertControls() {
    await this.angForm.removeControl("levelExpertF");
    await this.angForm.removeControl("url");
    await this.angForm.removeControl("academic");
    await this.angForm.removeControl("city");
    await this.angForm.removeControl("university");
    await this.angForm.removeControl("campus");
  }

  async loadData() {
    //extraemos datos de profesions
    let profesionSub = await this.searchService
      .getProfession()
      .subscribe((res) => {
        this.profesions = res.map((item) => {
          return { id: item.id, name: item.description };
        });
        this.profesions = this.profesions;
        this.add_item_default_array(this.profesions);
      });

    //extraemos datos de nivel de educacion
    let levelSub = await this.searchService
      .getLevelEducation()
      .subscribe((res) => {
        this.levelsEdications = res.values.map((item: any) => {
          return { id: item.id, name: item.name };
        });
        this.levelsEdications = this.levelsEdications;
        this.add_item_default_array(this.levelsEdications);
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

    let citiesSub = await this._addressService.getCitiesActive().subscribe(
      (res: any) => {
        this.cities = res;
        this.add_item_default_array(this.cities);
      },
      (error) => {
        console.log(error);
      }
    );

    this.subscribes.push(
      profesionSub,
      levelSub,
      preferencesSub,
      interestingsSub,
      citiesSub
    );
  }

  private async add_item_default_array(array) {
    let name_translate = await this.languageService.translate
      .get("register.chooseOption")
      .toPromise();
    const object_default = {
      id: 0,
      name: name_translate,
    };
    array.unshift(object_default);
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
    return (this.flagN = 50);
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
    // console.log("event change student", evt);
    if (this.checkEs) {
      this.addStudentControls();
      this.validateRole = false;

      this.angForm.get("checkTe").disable();
      this.angForm.get("checkEx").disable();

      this.typeRolOptionRegister = 'STUDENT';
      this.loadDataEmailExtension();

    } else {
      this.removeStudentControls();

      this.angForm.get("checkTe").enable();
      this.angForm.get("checkEx").enable();
    }
  }
  async removeEmail() {
    await this.angForm.removeControl("email");
  }

  addEmailPathTeacherAndExpert() {
    this.angForm.addControl(
      "email",
      new UntypedFormControl(null, [
        Validators.required,
        Validators.email,
        // Validators.pattern(this.patternCorreo),
        /*^[A-Za-z\\d]+(@)+[u]+[p]+[s]+.+[e]+[d]+[u]+.+[e]+[c]*/
      ])
    );
  }
  onChangeTypeTeacher(evt) {
    if (this.checkTe) {
      this.addProfesionControl();
      this.validateRole = false;

      this.angForm.get("check").disable();
      this.angForm.get("checkEx").disable();

      this.typeRolOptionRegister = 'TEACHER';
      this.loadDataEmailExtension();
    } else {
      this.removeControlsTeacher();
      this.angForm.get("check").enable();
      this.angForm.get("checkEx").enable();
    }
  }

  onChangeTypeExpert(evt) {
    if (this.checkEx) {
      this.addExpertControls();
      this.validateRole = false;

      this.angForm.get("checkTe").disable();
      this.angForm.get("check").disable();

      this.typeRolOptionRegister = 'EXPERT';
      this.loadDataEmailExtension();
    } else {
      this.removeExpertControls();
      this.angForm.get("checkTe").enable();
      this.angForm.get("check").enable();
    }
  }

  onChangeDisability() {
    if (!this.disability) {
      //this.removeTypeDisability();
      this.angForm.get("typeDisability").clearValidators();
      this.angForm.updateValueAndValidity();
    } else {
      this.angForm.get("typeDisability").setValidators([Validators.required]);
      this.angForm.get("typeDisability").updateValueAndValidity();
    }
  }

  async validateUser() {
    this.angForm.markAllAsTouched();
    this.angForm.updateValueAndValidity();
    try {
      //console.log(this.angForm);
      if (this.checkTe || this.checkEx || this.checkEs) {
        if (this.angForm.valid) {
          if (this.angForm.value.terms) {
            this.validateRole = false;
            Swal.fire({
              allowOutsideClick: false,
              text: "Registrando...",
              icon: "info",
            });
            Swal.showLoading(null);
            this.getDataMaped();
            //console.log("user send", this.user);
            let registerSub = await this.auth.registerUser(this.user).subscribe(
              (res) => {
                this.registred = true;
                this.validateEmail = false;
                if (
                  this.user.roles[0] == "teacher" ||
                  this.user.roles[0] == "expert" ||
                  (this.user.roles[0] == "student" &&
                    this.user.has_disability == "no")
                ) {
                  this.message_check_email = true;
                }
                Swal.close();
              },
              async (err) => {
                console.log(err);
                if (err.error.email[0] == "El correo debe ser institucionals") {
                  let message_des = await this.languageService.translate
                    .get("register.emailInstitutional")
                    .toPromise();
                  this.showError(message_des);
                } else if (err.error.email[0] == "This field must be unique.") {
                  let message_des = await this.languageService.translate
                    .get("register.emailinsertError")
                    .toPromise();
                  this.showError(message_des);
                  this.flagAlert = true;
                }
                this.validateEmail = true;
                Swal.close();
              }
            );

            this.subscribes.push(registerSub);
          } else {
            this.markTouchForm();
          }
        } else {
          this.markTouchForm();
          let message_des = await this.languageService.translate
            .get("register.formInvalid")
            .toPromise();
          this.showError(message_des);
          setTimeout(function () {
            this.msgs = [];
          }, 3);
        }
      } else {
        this.validateRole = true;
        this.markTouchForm();
        let message_des = await this.languageService.translate
          .get("register.formInvalid")
          .toPromise();
        this.showError(message_des);
        setTimeout(function () {
          this.msgs = [];
          this.messageService = [];
        }, 3000);
      }
    } catch (error) {
      this.showError(error.error?.message || error.message);
    }
  }

  showError(message) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  }

  selectPreferences(evt) {
    if (this.preferenceAreasSave.includes(evt)) {
      this.preferenceAreasSave = this.preferenceAreasSave.filter(
        (res) => res != evt
      );
    } else {
      this.preferenceAreasSave.push(evt);
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
      //this.user.knowledge_areas = this.angForm.value.areasInteres.map(
      //(res) => res.id
      //);
      this.user.knowledge_areas = this.angForm.value.areasInteres;
      /*this.user.preferences = this.angForm.value.areasPrefer.map(
        (res) => res.id
      );*/
      this.user.preferences = this.angForm.value.areasPrefer;

      this.user.has_disability = this.angForm.value.disability;
      if (this.user.has_disability == "yes") {
        this.user.disability_description = this.angForm.value.typeDisability;
      }

      this.user.birthday = moment(this.angForm.value.calendar).format(
        "YYYY-MM-DD"
      );
    }

    if (this.checkTe) {
      this.user.professions = this.angForm.value.profession;

      this.user.city = this.angForm.value.city;
      this.user.university = this.angForm.value.university;
      this.user.campus = this.angForm.value.campus;
    }
    if (this.checkEx) {
      this.user.expert_level = this.angForm.value.levelExpertF;

      if (this.angForm.value.url != null) {
        this.user.web = this.angForm.value.url;
      }
      if (this.angForm.value.academic != null) {
        this.user.academic_profile = this.angForm.value.academic;
      }
    }
  }
  getYearRange() {
    let date = new Date();
    return `${`${date.getFullYear() - 22}:${date.getFullYear() - 6}`}`;
  }

  selectLevels(evt) {
    this.angForm.patchValue({
      educacionL: [Number(evt.target.value)],
    });
  }

  selectAreas(evt) {
    if (this.areasInterestings_data_save.includes(evt)) {
      this.areasInterestings_data_save =
        this.areasInterestings_data_save.filter((res) => res != evt);
    } else {
      this.areasInterestings_data_save.push(evt);
    }

    this.angForm.patchValue({
      areasInteres: this.areasInterestings_data_save,
    });
  }

  selectProfesion(evt) {
    this.angForm.patchValue({
      profession: [Number(evt.target.value)],
    });
  }

  //Generamos la consulta para obtener el mensaje.
  validateEmailPatter() {
    if (this.checkEs) {
      return;
    }

    let campo = this.angForm.controls["email"]?.value;
    // let emailRegex = /^([a-zA-Z0-9]+)@((?!hotmail|gmail|yahoo|outlook)(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    //let emailRegex = /^[a-z\d]+(@)+[u]+[p]+[s]+.+[e]+[d]+[u]+.+[e]+[c]/;
    //Se muestra un texto a modo de ejemplo, luego va a ser un icono
    let arrayDomains = [];
    let emailSplit = campo?.split('@');
    emailSplit = emailSplit[emailSplit.length - 1];
    this.emailsExtension.forEach(value => arrayDomains.push(value.domain));
    switch (this.typeOption) {
      case 'ALL':
          this.validateEmailPattern = false;
          break;
      case 'ONLY':
        if (arrayDomains.includes(emailSplit)) {
          this.validateEmailPattern = false;
        } else {
          this.validateEmailPattern = true;
        }
        break;
      case 'EXCEPT':
        if (arrayDomains.includes(emailSplit)) {
          this.validateEmailPattern = true;
        } else {
          this.validateEmailPattern = false;
        }
        break;
    }


    // if (emailRegex.test(campo)) {
    //   this.validateEmailPattern = false;
    //   //return true;
    // } else {
    //   this.validateEmailPattern = true;
    //   //return false;
    // }
  }

  event_get_data_calendar(event) {
    this.angForm.controls["calendar"].setValue(event.detail.value);
    //calendar
  }

  async onChangeCity(evt) {
    try {
      this.angForm.controls["city"].setValue(Number(evt.target.value || 0));
      this.universities = [];
      let res: any = await this._addressService
        .getUniversitiesByCityActive(evt.target.value)
        .toPromise();
      this.universities = res;
      this.add_item_default_array(this.universities);
    } catch (error) {
      console.log(error);
    }
  }

  async onChangeUniversity(evt) {
    try {
      this.angForm.controls["university"].setValue(
        Number(evt.target.value || 0)
      );
      this.campusArray = [];
      let res: any = await this._addressService
        .getCampusByUniversityActive(evt.target.value)
        .toPromise();
      this.campusArray = res;
      this.add_item_default_array(this.campusArray);
    } catch (error) {
      console.log(error);
    }
  }
  async onChangeCampus(evt) {
    this.angForm.controls["campus"].setValue(Number(evt.target?.value || 0));
  }
}
