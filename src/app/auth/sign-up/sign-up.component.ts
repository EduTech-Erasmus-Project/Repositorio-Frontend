import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute, Params } from "@angular/router";
import Swal from "sweetalert2";
import { UserGeneral } from "src/app/core/models/userGeneral";
import { SearchService } from "src/app/services/search.service";
import { firstValueFrom, Subscription } from "rxjs";
import { MessageService } from "primeng/api";
import * as moment from "moment";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { EducationLevel } from "src/app/core/interfaces/EducationLevel";
import { KnowledgeArea } from "src/app/core/interfaces/KnowledgeArea";
import { focusFirstInvalidControl } from "src/app/core/utils/accessibility-focus";
import { translateInstant } from "src/app/core/utils/i18n.utils";
import { UserService } from "src/app/services/user.service";
import { UserLocation } from "src/app/core/interfaces/user-location";
import {
  UserLocationErrors,
  getLocationErrorMessage,
} from "src/app/core/utils/location-errors.utils";
import {
  PERSON_NAME_MAX_LENGTH,
  PERSON_NAME_PATTERN,
} from "src/app/core/utils/person-name.utils";
import {
  PreferenceAreaGroupResponse,
  PreferenceAreaOptionResponse,
  EmailDomainResponse,
  TypeUserOptionRegisterResponse,
} from "src/app/core/interfaces/api-contracts";

type RegisterRole = "expert" | "student" | "teacher";
type DisabilityValue = "yes" | "no";
type RoleToggleControl = "check" | "checkTe" | "checkEx";
type EmailDomainRuleType = "" | "ALL" | "ONLY" | "EXCEPT";

interface RegisterSelectOption {
  id: number;
  name: string;
}

interface RegisterPreferenceOption {
  value: number;
  label: string;
}

interface RegisterPreferenceGroup {
  value: number;
  label: string;
  items: RegisterPreferenceOption[];
}

type DuetDateChangeEvent = CustomEvent<{ value: string | null }>;
type FocusableDatePicker = { setFocus?: () => Promise<void> | void };

interface RegisterFormControls {
  name: FormControl<string | null>;
  lastname: FormControl<string | null>;
  check: FormControl<boolean | null>;
  checkTe: FormControl<boolean | null>;
  checkEx: FormControl<boolean | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  terms: FormControl<boolean | null>;
  calendar?: FormControl<string | null>;
  educacionL?: FormControl<number | null>;
  areasInteres?: FormControl<number[] | null>;
  areasPrefer?: FormControl<number[] | null>;
  disability?: FormControl<DisabilityValue | null>;
  typeDisability?: FormControl<string | null>;
  profession?: FormControl<number | null>;
  location?: FormControl<UserLocation | null>;
  levelExpertF?: FormControl<string | null>;
  url?: FormControl<string | null>;
  academic?: FormControl<string | null>;
}

/**
 * Gestiona el formulario publico de registro para estudiante, docente y experto.
 *
 * Responsabilidades:
 * - construir el formulario segun el rol solicitado en la URL
 * - cargar catalogos base; la ubicacion de docentes y expertos la resuelve
 *   `app-user-location-fields` con el catalogo de paises
 * - mapear el formulario al payload esperado por `user-management`
 * - advertir localmente cuando el correo no coincide con la politica institucional
 */

@Component({
    selector: "app-sign-up",
    templateUrl: "./sign-up.component.html",
    styleUrls: ["./sign-up.component.scss"],
    standalone: false
})
export class SignUpComponent implements OnInit, OnDestroy {
  public user: UserGeneral = new UserGeneral();
  public profesions: RegisterSelectOption[] = [];
  public levelsEdications: RegisterSelectOption[] = [];
  public preferenceAreas: RegisterPreferenceGroup[] = [];
  public areasInterestings: RegisterSelectOption[] = [];
  public angForm!: FormGroup<RegisterFormControls>;
  public show: boolean = false;
  private subscribes: Subscription[] = [];
  public validateRole: boolean = false;
  public showBackendEmailError = false;
  public showDuplicatedEmailError = false;
  public showPasswordRequirements = false;
  public registered = false;
  private typeRegister: RegisterRole | null = null;
  private initializedRole: RegisterRole | null = null;
  public showInstitutionalEmailWarning = false;
  public isSubmitting = false;
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
  public showVerificationEmailMessage: boolean = false;
  public termsDialogVisible = false;
  public registerErrorMessage = "";
  private emailDomains: EmailDomainResponse[] = [];
  private roleOptionCode = "";
  private emailDomainRuleType: EmailDomainRuleType = "";
  private destroyed = false;
  private termsDialogTrigger: HTMLElement | null = null;

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private _router: Router,
    private messageService: MessageService,
    private languageService: LanguageService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  private shouldRedirectInvalidRegisterType(
    rawRegisterType: unknown,
    parsedRegisterType: RegisterRole | null
  ): boolean {
    return rawRegisterType != null && parsedRegisterType == null;
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    const paramsSub = this.route.queryParams.subscribe((params: Params) => {
      const rawRegisterType = params["register"];
      const nextRole = this.parseRegisterType(rawRegisterType);

      if (this.shouldRedirectInvalidRegisterType(rawRegisterType, nextRole)) {
        void this._router.navigate(["/register"]);
        return;
      }

      this.typeRegister = nextRole;
      this.roleOptionCode = this.resolveRoleOptionRegister(nextRole);
      void this.addBreadcrumb();

      if (this.initializedRole !== nextRole || !this.angForm) {
        this.initializedRole = nextRole;
        void this.loadInitialCatalogsAndCreateForm();
      }
    });

    this.subscribes.push(paramsSub);
  }

  /**
   * Carga catalogos base y recrea el formulario para el rol actual.
   */
  async loadInitialCatalogsAndCreateForm() {
    await this.loadCatalogData();
    this.createForm();

    if (this.checkTe || this.checkEx) {
      await this.loadEmailDomainRules();
    }

    this.cdr.detectChanges();
  }

  /**
   * Carga la regla de correo institucional aplicable al rol actual.
   */
  private async loadEmailDomainRules() {
    let userType: TypeUserOptionRegisterResponse[];
    try {
      const typeUser = (await firstValueFrom(
        this.searchService.getTypeUserProfile()
      )) as TypeUserOptionRegisterResponse[];
      if (typeUser.length > 0) {
        userType = typeUser.filter((res) => res.description === this.roleOptionCode);
        if (!userType?.length || !userType[0]?.option_register) {
          this.emailDomainRuleType = "";
          this.emailDomains = [];
          return;
        }

        this.emailDomainRuleType =
          (userType[0].option_register.type_option as EmailDomainRuleType) || "";
        try {
          const optionRegisterId = userType[0].option_register.id;
          if (!optionRegisterId) {
            this.emailDomains = [];
            return;
          }

          const emailEx = await firstValueFrom(
            this.searchService.getEmailExtension(
              optionRegisterId,
              this.roleOptionCode
            )
          );

          if (emailEx.code == 200) {
            this.emailDomains = Array.isArray(emailEx.data) ? emailEx.data : [];
          }
        } catch (error) {
          this.emailDomains = [];
        }

      }
    } catch (error) {
      this.emailDomainRuleType = "";
      this.emailDomains = [];
    } finally {
      this.cdr.detectChanges();
    }


  }

  /**
   * Publica el breadcrumb del flujo de registro.
   */
  private async addBreadcrumb() {
    const registerLabel = await firstValueFrom(
      this.languageService.translate.get("menu.register")
    );

    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: registerLabel,
        routerLink: ["/register"],
      },
    ]);
  }

  createForm() {
    this.angForm = new FormGroup<RegisterFormControls>({
      name: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(PERSON_NAME_PATTERN),
        Validators.maxLength(PERSON_NAME_MAX_LENGTH),
        Validators.minLength(3),
      ]),
      lastname: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(PERSON_NAME_PATTERN),
        Validators.maxLength(PERSON_NAME_MAX_LENGTH),
        Validators.minLength(3),
      ]),
      check: new FormControl<boolean | null>(this.typeRegister == "student"),
      checkTe: new FormControl<boolean | null>(this.typeRegister == "teacher"),
      checkEx: new FormControl<boolean | null>(this.typeRegister === "expert"),
      email: new FormControl<string | null>(null, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(
          "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}"
        ),
      ]),
      terms: new FormControl<boolean | null>(false, [Validators.required]),
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

  private disable_Buttons_type_member(type1: RoleToggleControl, type2: RoleToggleControl) {
    this.angForm.get(type1)?.disable();
    this.angForm.get(type2)?.disable();
  }

  getconditionParams(type: RegisterRole): boolean {
    return this.typeRegister === type;
  }

  addStudentControls() {
    //console.log("create student controls");
    this.angForm.addControl(
      "calendar",
      new FormControl("2000-01-01", { validators: [Validators.required] })
    );
    this.angForm.addControl(
      "educacionL",
      new FormControl<number | null>(null, { validators: [Validators.required] })
    );

    this.angForm.addControl(
      "areasInteres",
      new FormControl<number[]>([], { validators: [Validators.required] })
    );
    this.angForm.addControl(
      "areasPrefer",
      new FormControl<number[]>([], { validators: [Validators.required] })
    );
    this.angForm.addControl(
      "disability",
      new FormControl<DisabilityValue>("no", { validators: [Validators.required] })
    );
    this.angForm.addControl("typeDisability", new FormControl<string | null>(null));
  }

  removeStudentControls() {
    this.angForm.removeControl("calendar");
    this.angForm.removeControl("educacionL");
    this.angForm.removeControl("areasInteres");
    this.angForm.removeControl("areasPrefer");
    this.angForm.removeControl("disability");
    this.angForm.removeControl("typeDisability");
  }

  addTypeDisability() {
    this.angForm.addControl(
      "typeDisability",
      new FormControl<string | null>(null, { validators: [Validators.required] })
    );
  }

  removeTypeDisability() {
    this.angForm.removeControl("typeDisability");
  }

  addProfesionControl() {
    this.angForm.addControl(
      "profession",
      new FormControl<number | null>(null, { validators: [Validators.required] })
    );
    this.addLocationControl();
    // this.removeEmail();
    //   this.addEmailPathTeacherAndExpert();
  }

  /**
   * Ubicacion de docentes y expertos: un solo control con los 6 campos de texto
   * que espera el backend. `app-user-location-fields` valida cada campo.
   */
  private addLocationControl() {
    if (!this.angForm.contains("location")) {
      this.angForm.addControl(
        "location",
        new FormControl<UserLocation | null>(null, { validators: [Validators.required] })
      );
    }
  }

  removeControlsTeacher() {
    try {
      //this.dropDowProfession.nativeElement.remove();
      this.angForm.removeControl("profession");
      if (!this.checkEx) {
        this.angForm.removeControl("location");
      }
    } catch (error) {
      console.log(error);
    }
  }

  addExpertControls() {
    this.angForm.addControl(
      "levelExpertF",
      new FormControl("Bajo", { validators: [Validators.required] })
    );
    this.angForm.addControl(
      "url",
      new FormControl<string | null>(null, {
        validators: [Validators.required],
      })
    );
    this.angForm.addControl(
      "academic",
      new FormControl<string | null>(null, { validators: [Validators.required] })
    );
    this.addLocationControl();
    //  this.removeEmail();
    //  this.addEmailPathTeacherAndExpert();
  }

  removeExpertControls() {
    this.angForm.removeControl("levelExpertF");
    this.angForm.removeControl("url");
    this.angForm.removeControl("academic");
    if (!this.checkTe) {
      this.angForm.removeControl("location");
    }
  }

  /**
   * Carga los catalogos que alimentan los formularios de registro.
   */
  async loadCatalogData() {
    try {
      const [
        professions,
        educationLevels,
        preferences,
        interestAreas,
      ] = await Promise.all([
        firstValueFrom(this.searchService.getProfession()),
        firstValueFrom(this.searchService.getLevelEducation()),
        firstValueFrom(this.searchService.getPreferencesArea()),
        firstValueFrom(this.searchService.getInterestAreas()),
      ]);

      this.profesions = professions.map((item) => ({
        id: item.id,
        name: item.description,
      }));

      this.levelsEdications = educationLevels.values.map((item: EducationLevel) => ({
        id: item.id,
        name: item.name,
      }));

      this.preferenceAreas = preferences.map((item: PreferenceAreaGroupResponse) => ({
        value: item.id,
        label: item.preferences_are,
        items: item.preferences.map((preference: PreferenceAreaOptionResponse) => ({
          value: preference.id,
          label: preference.description,
        })),
      }));

      this.areasInterestings = interestAreas.values.map((item: KnowledgeArea) => ({
        id: item.id,
        name: item.name,
      }));
    } catch (error) {
      this.profesions = [];
      this.levelsEdications = [];
      this.preferenceAreas = [];
      this.areasInterestings = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  validarCamp(event): boolean {
    if (this.angForm?.get("name")?.hasError("pattern")) {
      return true;
    }
    return false;
  }

  getErrorNumber(field: string): number {
    if (this.angForm?.get(field)?.hasError("pattern")) {
      return 0;
    }
    return 50;
  }

  get checkEs() {
    return this.angForm?.controls.check?.value ?? false;
  }
  get checkTe() {
    return this.angForm?.controls.checkTe?.value ?? false;
  }
  get checkEx() {
    return this.angForm?.controls.checkEx?.value ?? false;
  }
  get disability() {
    return this.angForm?.controls.disability?.value === "yes";
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
  get passwordValue(): string {
    return this.password?.value ?? "";
  }
  get passwordHasValidLength(): boolean {
    const value = this.passwordValue;
    return value.length >= 8 && value.length <= 30 && !/[\r\n]/.test(value);
  }
  get passwordHasDigit(): boolean {
    return /\d/.test(this.passwordValue);
  }
  get passwordHasLowercase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }
  get passwordHasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }
  get hasPendingPasswordRequirements(): boolean {
    return !(
      this.passwordHasValidLength &&
      this.passwordHasDigit &&
      this.passwordHasLowercase &&
      this.passwordHasUppercase
    );
  }
  get shouldShowPasswordRequirements(): boolean {
    return this.hasPendingPasswordRequirements && (
      this.showPasswordRequirements ||
      this.passwordValue.length > 0 ||
      !!this.password?.hasError("pattern")
    );
  }
  getNameDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.name?.invalid && (this.name.dirty || this.name.touched)) {
      if (this.name.errors?.["required"]) {
        ids.push("nameLabel");
      }
      if (this.name.errors?.["pattern"]) {
        ids.push("nameLabel2");
      }
      if (this.name.hasError("minlength")) {
        ids.push("nameLabel3");
      }
    }

    return ids.length ? ids.join(" ") : null;
  }
  getLastnameDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.lastname?.invalid && (this.lastname.dirty || this.lastname.touched)) {
      if (this.lastname.errors?.["required"]) {
        ids.push("lastName1");
      }
      if (this.lastname.errors?.["pattern"]) {
        ids.push("lastName2");
      }
      if (this.lastname.hasError("minlength")) {
        ids.push("lastName3");
      }
    }

    return ids.length ? ids.join(" ") : null;
  }
  getEmailDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.email?.invalid && (this.email.dirty || this.email.touched)) {
      if (this.email.errors?.["required"]) {
        ids.push("emailLabel");
      }
      if (this.email.errors?.["email"] && (this.checkEx || this.checkTe || this.checkEs)) {
        ids.push("emailLabel1");
      }
    }

    if (this.showInstitutionalEmailWarning && (this.checkEx || this.checkTe)) {
      ids.push("emailLabel3");
    }
    if (this.showBackendEmailError && !this.showDuplicatedEmailError) {
      ids.push("emailLabel4");
    }
    if (this.showDuplicatedEmailError) {
      ids.push("emailLabel5");
    }

    return ids.length ? ids.join(" ") : null;
  }
  getPasswordDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.password?.invalid && (this.password.dirty || this.password.touched) && this.password.errors?.["required"]) {
      ids.push("password-required");
    }
    if (this.shouldShowPasswordRequirements) {
      ids.push("password-requirements");
    }

    return ids.length ? ids.join(" ") : null;
  }
  getTermsDescribedBy(): string | null {
    return !this.terms?.value && (this.terms?.dirty || this.terms?.touched)
      ? "terms-error"
      : null;
  }
  onPasswordFocus(): void {
    this.showPasswordRequirements = true;
  }
  onPasswordBlur(): void {
    if (!this.passwordValue) {
      this.showPasswordRequirements = false;
    }
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
  get location() {
    return this.angForm.get("location");
  }
  get terms() {
    return this.angForm.get("terms");
  }
  markTouchForm() {
    Object.values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  togglePasswordVisibility() {
    this.show = !this.show;
  }

  openTermsDialog(event: Event) {
    this.termsDialogTrigger = event.currentTarget as HTMLElement;
    this.termsDialogVisible = true;
    this.cdr.detectChanges();
  }

  closeTermsDialog() {
    this.termsDialogVisible = false;
    this.cdr.detectChanges();
  }

  acceptTermsFromDialog() {
    this.terms?.setValue(true);
    this.terms?.markAsTouched();
    this.closeTermsDialog();
  }

  restoreTermsDialogFocus() {
    this.termsDialogTrigger?.focus();
    this.termsDialogTrigger = null;
  }

  onChangeTypeStudentEnter(evt) {
    if (this.checkEs) {
      this.addStudentControls();
      this.validateRole = false;

      this.angForm.get("checkTe").disable();
      this.angForm.get("checkEx").disable();

      this.roleOptionCode = "STUDENT";
      void this.loadEmailDomainRules();

    } else {
      this.removeStudentControls();

      this.angForm.get("checkTe").enable();
      this.angForm.get("checkEx").enable();
    }
  }

  onChangeTypeTeacher(evt) {
    if (this.checkTe) {
      this.addProfesionControl();
      this.validateRole = false;

      this.angForm.get("check").disable();
      this.angForm.get("checkEx").disable();

      this.roleOptionCode = "TEACHER";
      void this.loadEmailDomainRules();
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

      this.roleOptionCode = "EXPERT";
      void this.loadEmailDomainRules();
    } else {
      this.removeExpertControls();
      this.angForm.get("checkTe").enable();
      this.angForm.get("check").enable();
    }
  }

  onChangeDisability() {
    const typeDisabilityControl = this.angForm.get("typeDisability");

    if (!typeDisabilityControl) {
      return;
    }

    if (!this.disability) {
      typeDisabilityControl.setValue(null);
      typeDisabilityControl.clearValidators();
      typeDisabilityControl.updateValueAndValidity();
      return;
    }

    typeDisabilityControl.setValidators([Validators.required]);
    typeDisabilityControl.updateValueAndValidity();
  }

  /**
   * Valida el formulario actual y dispara el registro contra el backend.
   */
  async validateUser() {
    this.registerErrorMessage = "";
    this.angForm.markAllAsTouched();
    this.angForm.updateValueAndValidity();
    try {
      const selectedRoles = this.getSelectedRegisterRoles();

      if (selectedRoles.length !== 1) {
        this.validateRole = true;
        this.markTouchForm();
        document.getElementById("student")?.focus();
        const messageDes = await firstValueFrom(
          this.languageService.translate.get("register.formInvalid")
        );
        this.showError(messageDes);
        return;
      }

      if (this.angForm.invalid || !this.angForm.value.terms) {
        this.validateRole = false;
        this.markTouchForm();
        this.focusInvalidControl();
        const messageDes = await firstValueFrom(
          this.languageService.translate.get("register.formInvalid")
        );
        this.showError(messageDes);
        return;
      }

      this.validateRole = false;
      this.isSubmitting = true;
      Swal.fire({
        allowOutsideClick: false,
        text: translateInstant(this.languageService.translate, "register.submitting", "Registrando..."),
        icon: "info",
      });
      Swal.showLoading(null);

      this.mapFormDataToUserPayload();
      if (!this.user.roles || this.user.roles.length !== 1) {
        throw new Error("Invalid register role payload");
      }
      await firstValueFrom(this.userService.registerUser(this.user));

      this.registered = true;
      this.showBackendEmailError = false;
      this.showDuplicatedEmailError = false;

      if (
        this.user.roles[0] === "teacher" ||
        this.user.roles[0] === "expert" ||
        (this.user.roles[0] === "student" && this.user.has_disability === "no")
      ) {
        this.showVerificationEmailMessage = true;
      }

      this.syncView();
    } catch (error: unknown) {
      const httpError = error as HttpErrorResponse & {
        error?: {
          email?: string[];
          message?: string;
        } & UserLocationErrors;
        message?: string;
      };

      if (httpError?.error?.email?.[0] === "El correo debe ser institucionals") {
        const messageDes = await firstValueFrom(
          this.languageService.translate.get("register.emailInstitutional")
        );
        this.showError(messageDes);
      } else if (httpError?.error?.email?.[0] === "This field must be unique.") {
        const messageDes = await firstValueFrom(
          this.languageService.translate.get("register.emailinsertError")
        );
        this.showError(messageDes);
        this.showDuplicatedEmailError = true;
      } else if (getLocationErrorMessage(this.languageService.translate, httpError?.error)) {
        this.showError(getLocationErrorMessage(this.languageService.translate, httpError?.error));
      } else {
        this.showError(
          httpError?.error?.message ||
            httpError?.message ||
            translateInstant(this.languageService.translate, "message.titleError", "Error")
        );
      }
      this.showBackendEmailError = true;
      this.syncView();
    } finally {
      this.isSubmitting = false;
      Swal.close();
      this.syncView();
    }
  }

  showError(message: string) {
    this.registerErrorMessage = message;
    this.messageService.add({
      severity: "error",
      summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
      detail: message,
    });
  }

  /**
   * Convierte el formulario actual al payload esperado por el backend de registro.
   */
  mapFormDataToUserPayload() {
    const formValue = this.angForm.getRawValue();
    const userPayload = new UserGeneral();
    const selectedRoles = this.getSelectedRegisterRoles();

    userPayload.roles = selectedRoles;
    userPayload.first_name = formValue.name;
    userPayload.last_name = formValue.lastname;
    userPayload.email = formValue.email;
    userPayload.password = formValue.password;

    if (selectedRoles.includes("student")) {
      userPayload.education_levels =
        formValue.educacionL !== null &&
        formValue.educacionL !== undefined
          ? [Number(formValue.educacionL)]
          : [];
      //this.user.knowledge_areas = this.angForm.value.areasInteres.map(
      //(res) => res.id
      //);
      userPayload.knowledge_areas = formValue.areasInteres;
      /*this.user.preferences = this.angForm.value.areasPrefer.map(
        (res) => res.id
      );*/
      userPayload.preferences = (formValue.areasPrefer as number[]) || [];

      userPayload.has_disability = formValue.disability;
      if (userPayload.has_disability === "yes") {
        userPayload.disability_description = formValue.typeDisability;
      }

      userPayload.birthday = moment(formValue.calendar).format(
        "YYYY-MM-DD"
      );
    }

    if (selectedRoles.includes("teacher")) {
      userPayload.professions =
        formValue.profession !== null &&
        formValue.profession !== undefined
          ? [Number(formValue.profession)]
          : [];
    }

    if (
      (selectedRoles.includes("teacher") || selectedRoles.includes("expert")) &&
      formValue.location
    ) {
      Object.assign(userPayload, formValue.location);
    }
    if (selectedRoles.includes("expert")) {
      userPayload.expert_level = (formValue.levelExpertF as string) || "";

      if (formValue.url != null) {
        userPayload.web = formValue.url as string;
      }
      if (formValue.academic != null) {
        userPayload.academic_profile = formValue.academic as string;
      }
    }

    this.user = userPayload;
  }

  private getSelectedRegisterRoles(): RegisterRole[] {
    const formValue = this.angForm?.getRawValue();

    if (!formValue) {
      return [];
    }

    const roles: RegisterRole[] = [];
    if (formValue.check === true) {
      roles.push("student");
    }
    if (formValue.checkTe === true) {
      roles.push("teacher");
    }
    if (formValue.checkEx === true) {
      roles.push("expert");
    }

    return roles;
  }

  private parseRegisterType(value: unknown): RegisterRole | null {
    if (value === "expert" || value === "student" || value === "teacher") {
      return value;
    }

    return null;
  }

  private resolveRoleOptionRegister(role: RegisterRole | null): string {
    switch (role) {
      case "student":
        return "STUDENT";
      case "teacher":
        return "TEACHER";
      case "expert":
        return "EXPERT";
      default:
        return "";
    }
  }

  //Generamos la consulta para obtener el mensaje.
  /**
   * Evalua la regla local de dominio institucional para roles docentes y expertos.
   *
   * El backend mantiene la validacion final, pero esta capa evita que el usuario
   * llegue a submit sin una advertencia temprana cuando el dominio no coincide.
   */
  validateInstitutionalEmailPolicy() {
    if (this.checkEs) {
      return;
    }

    const campo = this.angForm.controls["email"]?.value?.trim?.() || "";

    if (!campo || !campo.includes("@")) {
      this.showInstitutionalEmailWarning = false;
      return;
    }

    const emailSplit = campo.split("@").pop();

    if (!emailSplit) {
      this.showInstitutionalEmailWarning = false;
      return;
    }

    if (!this.emailDomainRuleType) {
      this.showInstitutionalEmailWarning = false;
      return;
    }

    const arrayDomains = (this.emailDomains || [])
      .map((value) => value?.domain)
      .filter(Boolean);

    switch (this.emailDomainRuleType) {
      case "ALL":
        this.showInstitutionalEmailWarning = false;
        break;
      case "ONLY":
        if (arrayDomains.includes(emailSplit)) {
          this.showInstitutionalEmailWarning = false;
        } else {
          this.showInstitutionalEmailWarning = true;
        }
        break;
      case "EXCEPT":
        if (arrayDomains.includes(emailSplit)) {
          this.showInstitutionalEmailWarning = true;
        } else {
          this.showInstitutionalEmailWarning = false;
        }
        break;
    }
  }

  onDateSelected(event: DuetDateChangeEvent) {
    this.angForm.controls["calendar"]?.setValue(event.detail.value);
  }

  restoreDatePickerFocus(event: Event) {
    const picker = (event.currentTarget || event.target) as FocusableDatePicker | null;

    if (typeof picker?.setFocus !== "function") {
      return;
    }

    requestAnimationFrame(() => {
      const focusResult = picker.setFocus?.();
      if (focusResult instanceof Promise) {
        focusResult.catch(() => {});
      }
    });
  }


  private focusInvalidControl() {
    setTimeout(() => {
      focusFirstInvalidControl(document.getElementById("loginForm"));
    }, 0);
  }

  private syncView() {
    if (!this.destroyed) {
      this.cdr.detectChanges();
    }
  }
}




