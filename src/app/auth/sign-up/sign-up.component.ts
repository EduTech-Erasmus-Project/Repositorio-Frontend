import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterContentInit,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/admin/services/auth.service";
import Swal from "sweetalert2";
import {SelectItemGroup } from "primeng/api";
import { UserGeneral } from "src/app/core/models/userGeneral";
import { SearchService } from "src/app/services/search.service";
import { Subscription } from "rxjs";
import {MessageService} from 'primeng/api';
import * as moment from "moment";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"]
})
export class SignUpComponent implements OnInit, OnDestroy {
  @ViewChild("dropDowProfession") private dropDowProfession: ElementRef;
  
  //variables para activar los checkbox
  //dark: boolean = false;
  public flagprofession = false;
  public user: UserGeneral = new UserGeneral();
  public profesions: any[];
  public levelsEdications: any[];
  public preferenceAreas: SelectItemGroup[];
  public areasInterestings: any[];
  public areasInterestings_data_save: any[] = [];
  public preferenceAreasSave: any[] = [];
  public selectedValues: string[] = [];
  public angForm: FormGroup;
  public show: boolean = false;
  public flagN: number = 20;
  private subscribes: Subscription[] = [];
  public validateRole: boolean = false;
  public validateEmail: boolean = false;
  public flagAlert: boolean = false;
  public registred: boolean = false;
  public patternCorreo: string = `^([a-zA-Z0-9]+.+)@((?!hotmail|gmail|yahoo|outlook)(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$`;
  private typeRegister: string;
  public validateEmailPattern = false;
  public msgs: any[];
  public educacionLevel:any;
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
    private auth: AuthService,
    private fb: FormBuilder,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    //this.dark = localStorage.getItem('dart_active') === 'true' ? true : false;
    this.route.queryParams.subscribe((params) => {
      this.typeRegister = params.register;
    });
    this.createForm();
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.loadData();
    
    //new test();
    //this.getYearRange();
  }

  
  onSubmit() {}
  createForm() {
    this.angForm = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.pattern("[a-zA-ZñÑáéíóúÁÉÍÓÚ\s ]+"),
          Validators.maxLength(50),
          Validators.minLength(3),
        ],
      ],
      lastname: [
        null,
        [
          Validators.required,
          Validators.pattern("[a-zA-ZñÑáéíóúÁÉÍÓÚ\s ]+"),
          Validators.maxLength(50),
          Validators.minLength(3),
        ],
      ],
      check: [this.typeRegister === "student"],
      checkTe: [this.typeRegister === "teacher"],
      checkEx: [this.typeRegister === "expert"],
      email: [
        null,
        [
          Validators.required,
          //Validators.pattern(this.patternCorreo),
          Validators.email
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
    //console.log("validate es check", this.angForm.controls)
    if (this.checkEs) {
      this.addStudentControls();
    } else {
      this.removeStudentControls();
    }
    if (this.checkTe) {
      this.addProfesionControl();
    } else {
      this.removeProfesionControl();
    }
    if (this.checkEx) {
      this.addExpertControls();
    } else {
      this.removeExpertControls();
    }
  }

  getconditionParams(type: string): boolean {
    return this.typeRegister === type;
  }

  addStudentControls() {
    //console.log("create student controls");
    this.angForm.addControl(
      "calendar",
      new FormControl("2000-01-01", [Validators.required])
    );
    this.angForm.addControl(
      "educacionL",
      new FormControl(null, [Validators.required])
    );

    this.angForm.addControl(
      "areasInteres",
      new FormControl(null, [Validators.required])
    );
    this.angForm.addControl(
      "areasPrefer",
      new FormControl(null, [Validators.required])
    );
    this.angForm.addControl(
      "disability",
      new FormControl("no", [Validators.required])
    );
  }

  removeStudentControls() {
    // console.log("remove student controls");
    this.angForm.removeControl("calendar");
    this.angForm.removeControl("educacionL");
    this.angForm.removeControl("areasInteres");
    this.angForm.removeControl("areasPrefer");
  }

  addTypeDisability() {
    this.angForm.addControl(
      "typeDisability",
      new FormControl(null, Validators.required)
    );
  }

  removeTypeDisability() {
    this.angForm.removeControl("typeDisability");
  }

  addProfesionControl() {
    let object_profession = this.profesions[0];
    this.angForm.addControl(
      "profession",
      new FormControl(object_profession, Validators.required)
    );

   // this.removeEmail();   
   //   this.addEmailPathTeacherAndExpert();

  }

  removeProfesionControl() {
    try {
      this.dropDowProfession.nativeElement.remove();
      //console.log("move")
    } catch (error) {}
    this.angForm.removeControl("profession");
  }

  addExpertControls() {
    this.angForm.addControl(
      "levelExpertF",
      new FormControl("Bajo", Validators.required)
    );
    this.angForm.addControl(
      "url",
      new FormControl(null, [
        // Validators.pattern(
        //   '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
        // ),
      ])
    );
    this.angForm.addControl(
      "academic",
      new FormControl(null
        )
    );

  //  this.removeEmail();   
  //  this.addEmailPathTeacherAndExpert();
    
  }

  async removeExpertControls() {
    await this.angForm.removeControl("levelExpertF");
    await this.angForm.removeControl("url");
    await this.angForm.removeControl("academic");
  }

  async loadData() {
    //extraemos datos de profesions
    let profesionSub = await this.searchService
      .getProfession()
      .subscribe((res) => {
        this.profesions = res.map((item) => {
          return { id: item.id, name: item.description };
        });
        //console.log(this.profesions);
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

    this.subscribes.push(
      profesionSub,
      levelSub,
      preferencesSub,
      interestingsSub
    );
  }

  private add_item_default_array(array){
    const object_default={
      id:0,
      name: 'Elige una opción'
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

      this.angForm.get('checkTe').disable();
      this.angForm.get('checkEx').disable();
    } else {
      this.removeStudentControls();
      
      this.angForm.get('checkTe').enable();
      this.angForm.get('checkEx').enable();
    }
  }
async removeEmail(){
  await this.angForm.removeControl("email");
}

addEmailPathTeacherAndExpert(){
  
  this.angForm.addControl(
    "email",
    new FormControl(null, [
      Validators.required,
      Validators.email
     // Validators.pattern(this.patternCorreo),
      /*^[A-Za-z\\d]+(@)+[u]+[p]+[s]+.+[e]+[d]+[u]+.+[e]+[c]*/
    ],)
  );
}
   onChangeTypeTeacher(evt) {
    if (this.checkTe) {
      this.addProfesionControl();
      this.validateRole = false;
      this.angForm.get('check').disable();
      this.angForm.get('checkEx').disable();
    }else {
      this.removeProfesionControl();
      this.angForm.get('check').enable();
      this.angForm.get('checkEx').enable();
    }   
  }

  onChangeTypeExpert(evt) {
    if (this.checkEx) {
      this.addExpertControls();
      this.validateRole = false;
      this.angForm.get('checkTe').disable();
      this.angForm.get('check').disable();
    } else {
      this.removeExpertControls();
      this.angForm.get('checkTe').enable();
      this.angForm.get('check').enable();
    }
  }

  onChangeDisability() {
    if (this.disability) {
      this.addTypeDisability();
    } else {
      this.removeTypeDisability();
    }
  }

  async validateUser() {
    this.angForm.markAllAsTouched();
    this.angForm.updateValueAndValidity();
    
    if (this.checkTe || this.checkEx || this.checkEs) {
      //console.log("Si paso1")
      if (this.angForm.valid) {
        //console.log("Si paso")
        if (this.angForm.value.terms) {
          
          this.validateRole = false;
          Swal.fire({
            allowOutsideClick: false,
            text: "Registrando...",
            icon: "info",
          });
          Swal.showLoading();
          this.getDataMaped();

          let registerSub = await this.auth.registerUser(this.user).subscribe(
            (res) => {
              this.registred = true;
              this.validateEmail = false;
              Swal.close();
            },
            (err) => {
              console.log(err);
              if (err.error.email[0] == "El correo debe ser institucionals") {      
               this.showError('El correo electronico debe ser institucional');
              } else if (err.error.email[0] == "This field must be unique.") {
                this.showError('El correo que ingreso ya se encuentra registrado');
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
        this.showError('El formulario es invalido');
        //this.msgs.push({severity:'error', summary:'Mensaje de error', detail:'El formulario es invalido'});
        setTimeout(function() {
          this.msgs = [];
        },3)
      }
    } else {
      this.validateRole = true;
      this.markTouchForm();
      this.showError('El formulario es invalido');
      setTimeout(function() {
        this.msgs = [];
        this.messageService = [];
      },3000)
      
    }

  }

 
  showError(message) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
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
      //this.user.knowledge_areas = this.angForm.value.areasInteres.map(
        //(res) => res.id
      //);
      this.user.knowledge_areas = this.angForm.value.areasInteres;
      /*this.user.preferences = this.angForm.value.areasPrefer.map(
        (res) => res.id
      );*/
      this.user.preferences = this.angForm.value.areasPrefer;

      this.user.has_disability = this.angForm.value.typeDisability;

      this.user.birthday = moment(this.angForm.value.calendar).format(
        "YYYY-MM-DD"
      );
    }

    if (this.checkTe) {
      this.user.professions = this.angForm.value.profession;
    }
    if (this.checkEx) {

      this.user.expert_level = this.angForm.value.levelExpertF;
     
      if(this.angForm.value.url != null){
        this.user.web = this.angForm.value.url;
        
      }
      if(this.angForm.value.academic != null){
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
      profession: [Number(evt.target.value)]
    }); 
  }
  
  //Generamos la consulta para obtener el mensaje. 
  validateEmailPatter() {
    if(this.checkEs){
      return;
    }
    let campo = this.angForm.controls['email']?.value;
    let emailRegex = /^([a-zA-Z0-9]+)@((?!hotmail|gmail|yahoo|outlook)(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    //Se muestra un texto a modo de ejemplo, luego va a ser un icono
    if (emailRegex.test(campo)) {

      this.validateEmailPattern = false;
      //return true;
    } else {
      this.validateEmailPattern = true;
      //return false;
    }
  }

  event_get_data_calendar(event){
   
      this.angForm.controls['calendar'].setValue(
        event.detail.value
      );
    
    
    //calendar
  }
}
