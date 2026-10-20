
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { SearchService } from "../../../../../services/search.service";
import { LoginService } from "../../../../../services/login.service";
import { firstValueFrom, forkJoin } from "rxjs";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
} from "@angular/forms";
import { MessageService } from "primeng/api";
import { HttpErrorResponse } from "@angular/common/http";
import { UserGeneral } from "../../../../../core/models/userGeneral";
import { CurrentUser } from "../../../../../core/interfaces/CurrentUser";
import { Preference } from "../../../../../core/interfaces/Preference";
import { KnowledgeArea } from "../../../../../core/interfaces/KnowledgeArea";
import { EducationLevel } from "../../../../../core/interfaces/EducationLevel";

import * as moment from "moment";
import Swal from "sweetalert2";
import { UserService } from "../../../../../services/user.service";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import {
  PERSON_NAME_PATTERN,
  PERSON_NAME_VALIDATORS,
  controlHasError,
  controlInvalid,
} from "../../shared/settings-form.utils";
import { coerceEventRelationId } from "src/app/core/utils/coercion.utils";
import { translateInstant } from "src/app/core/utils/i18n.utils";
import {
  UserLocationErrors,
  getLocationErrorMessage,
} from "src/app/core/utils/location-errors.utils";
import { PERSON_NAME_MAX_LENGTH } from "src/app/core/utils/person-name.utils";
import {
  USER_LOCATION_MAX_LENGTH,
  UserLocation,
} from "src/app/core/interfaces/user-location";
import {
  PreferenceAreaGroupResponse,
  PreferenceAreaOptionResponse,
} from "src/app/core/interfaces/api-contracts";

type CatalogOption = { id?: number | string | null; name?: string };
type PreferenceOption = { value: number; label: string };
type PreferenceGroup = {
  value: number;
  label: string;
  items: PreferenceOption[];
};
type ProfileUserResponse = CurrentUser & UserGeneral & { image?: string };
type ProfileImageResponse = { image?: string };
/** Campos de ubicacion del usuario, en el orden del contrato del backend. */
const USER_LOCATION_FIELDS = Object.keys(USER_LOCATION_MAX_LENGTH) as (keyof UserLocation)[];
type DuetDateChangeEvent = CustomEvent<{ value: string | null }>;
type FocusableDatePicker = { setFocus?: () => Promise<void> | void };

@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"],
    standalone: false
})
/**
 * Gestiona el perfil editable del usuario autenticado.
 *
 * Este bloque mezcla tres responsabilidades del area privada:
 * - hidratar catalogos y datos actuales del usuario
 * - construir un formulario distinto segun los roles activos
 * - traducir el formulario a payloads de actualizacion e imagen
 */
export class ProfileComponent implements OnInit {
  @ViewChild("inputFile") inputFile?: ElementRef<HTMLInputElement>;
  public user: UserGeneral;
  public isLoading = true;
  public loadError = false;
  public profesions: CatalogOption[] = [];

  public levelsEdications: CatalogOption[] = [];
  public preferenceAreas: PreferenceGroup[] = [];
  public areasInterestings_data_save: number[] = [];
  public areasInterestings: CatalogOption[] = [];
  public angForm: UntypedFormGroup;
  public fileImage: File | null = null;
  public urlImageLocal: string | ArrayBuffer | null = null;
  public imageSatusErr: boolean = false;
  public imageUpload: boolean = false;
  public preferenceAreasSave: number[] = [];
  public interestAreasPanel: string | null = null;
  public preferencesPanel: string | null = null;

  public validateRole: boolean = false;
  public validateEmail: boolean = false;
  public blockEmail: boolean = false;

  public readonly nameMaxLength = PERSON_NAME_MAX_LENGTH;
  /** Largo maximo de `academic_profile` en el backend. */
  public readonly academicMaxLength = 100;

  public patternV: string =
    "^([a-zA-Z0-9_' - '.]+)@([a-zA-Z0-9_' - '.]+).([a-zA-Z]{2,5})$";
  private readonly textOnlyPattern = PERSON_NAME_PATTERN;
  constructor(
    private searchService: SearchService,
    private loginService: LoginService,
    private userService: UserService,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    this.configureBreadcrumb();
  }

  ngOnInit(): void {
    this.loadData();
  }

  get localization() {
    const datePicker = this.languageService.translate.instant("profile.datePicker");
    return {
      ...datePicker,
      locale: this.languageService.translate.currentLang === "en" ? "en-US" : "es-ES",
    };
  }

  /**
   * Mantiene el breadcrumb de `settings/profile` alineado con el idioma actual.
   */
  private async configureBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await firstValueFrom(this.languageService.translate.get("menu.settings")) },
      { label: await firstValueFrom(this.languageService.translate.get("menu.sideMenu.myAccount")), routerLink: ["/settings/profile"] },
    ]);
  }

  /**
   * Hidrata el formulario desde cinco fuentes a la vez para evitar cargas secuenciales.
   */
  async loadData() {
    this.isLoading = true;
    this.loadError = false;
    this.cdr.detectChanges();

    try {
      const {
        user,
        professions,
        levelEducation,
        preferencesArea,
        interestAreas,
      } = await firstValueFrom(
        forkJoin({
          user: this.userService.getUserDetail(this.loginService.user.id),
          professions: this.searchService.getProfession(),
          levelEducation: this.searchService.getLevelEducation(),
          preferencesArea: this.searchService.getPreferencesArea(),
          interestAreas: this.searchService.getInterestAreas(),
        })
      );

      this.user = user;
      this.profesions = (professions || []).map((item): CatalogOption => {
        return { id: item.id, name: item.description };
      });
      this.levelsEdications = (levelEducation?.values || []).map((item: EducationLevel): CatalogOption => {
        return { id: item.id, name: item.name };
      });
      this.preferenceAreas = (preferencesArea || []).map((item: PreferenceAreaGroupResponse): PreferenceGroup => {
        return {
          value: item.id,
          label: item.preferences_are,
          items: (item.preferences || []).map((preference: PreferenceAreaOptionResponse): PreferenceOption => {
            return { value: preference.id, label: preference.description };
          }),
        };
      });
      this.areasInterestings = (interestAreas?.values || []).map((item: KnowledgeArea): CatalogOption => {
        return { id: item.id, name: item.name };
      });

      this.createForm();
    } catch (error) {
      this.loadError = true;
      console.log(error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private getSelectEventId(event: unknown): number | null {
    return coerceEventRelationId(event);
  }

  onSubmit() { }

  /**
   * Construye el formulario base y agrega controles condicionales segun roles activos.
   */
  createForm() {
    this.angForm = this.fb.group({
      name: [
        this.user.first_name,
        PERSON_NAME_VALIDATORS,
      ],
      lastname: [
        this.user.last_name,
        PERSON_NAME_VALIDATORS,
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
    } else {
      this.removeProfesionControl();
    }

    if (this.checkEx) {
      this.addExpertControls();
    } else {
      this.removeExpertControls();
    }

    if (this.checkTe || this.checkEx) {
      this.addLocationControl();
    } else {
      this.angForm.removeControl("location");
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
      new UntypedFormControl(this.user.student ? this.getPrimaryLevelStudent() : null, [
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
        this.user.student?.disability_description || null
      )
    );

    this.syncDisabilityControlState();
  }

  removeStudentControls() {
    this.angForm.removeControl("calendar");
    this.angForm.removeControl("educacionL");
    this.angForm.removeControl("areasInteres");
    this.angForm.removeControl("areasPrefer");
    this.angForm.removeControl("disability");
    this.angForm.removeControl("typeDisability");
  }

  getPrimaryLevelStudent() {
    return this.user.student?.education_levels?.[0]?.id ?? null;
  }

  getInterestAreasStudent() {
    this.areasInterestings_data_save = (this.user.student?.knowledge_areas || []).map((item: KnowledgeArea) => item.id);
    return this.areasInterestings_data_save;
  }

  getPreferencesStudent() {
    this.preferenceAreasSave = (this.user.student?.preferences || []).map(
      (item: Preference) => item.id
    );
    return this.preferenceAreasSave;
  }

  getProfesionTeacher() {
    return (this.user.teacher?.professions || []).map((item) => {
      if (typeof item === "number") {
        return { id: item, name: String(item) };
      }

      return { id: item.id, name: item.description ?? item.name };
    });
  }

  addTypeDisability() {

  }

  removeTypeDisability() {
    this.angForm.controls["typeDisability"].setValue(null);
  }

  addProfesionControl() {
    if (this.angForm.contains("profession")) {
      return;
    }
    this.angForm.addControl(
      "profession",
      new UntypedFormControl(
        this.user.teacher ? this.getProfesionTeacher()[0]?.id ?? null : null,
        Validators.required
      )
    );
  }

  /**
   * Ubicacion de docentes y expertos como un solo control. La precarga
   * (buscar pais, provincia y ciudad en el catalogo) la hace
   * `app-user-location-fields`.
   */
  addLocationControl() {
    if (this.angForm.contains("location")) {
      return;
    }
    this.angForm.addControl(
      "location",
      new UntypedFormControl(this.getUserLocation(), Validators.required)
    );
  }

  /** Ubicacion guardada del usuario, o `null` si no tiene ninguna. */
  private getUserLocation(): UserLocation | null {
    const location = {} as UserLocation;
    for (const field of USER_LOCATION_FIELDS) {
      location[field] = this.user?.[field] ?? "";
    }
    return USER_LOCATION_FIELDS.some((field) => location[field]) ? location : null;
  }

  removeProfesionControl() {
    if (this.angForm.contains("profession")) {
      this.angForm.removeControl("profession");
    }
  }

  addExpertControls() {
    if (this.angForm.contains("levelExpertF")) {
      return;
    }
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
        // Texto libre, como en el registro (los expertos suelen poner un enlace).
        Validators.maxLength(this.academicMaxLength),
      ])
    );
  }

  async removeExpertControls() {
    if (this.angForm.contains("levelExpertF")) {
      await this.angForm.removeControl("levelExpertF");
    }
    if (this.angForm.contains("url")) {
      await this.angForm.removeControl("url");
    }
    if (this.angForm.contains("academic")) {
      await this.angForm.removeControl("academic");
    }
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
    this.syncDisabilityControlState();
  }

  /**
   * Valida el formulario, genera el payload por rol y sincroniza la sesion local
   * cuando el backend confirma la actualizacion.
   */
  async validateUser() {
    if (!this.hasSelectedRole()) {
      this.validateRole = true;
      this.markTouchForm();
      return;
    }

    if (!this.angForm.valid) {
      this.markTouchForm();
      this.showError(translateInstant(this.languageService.translate, "register.formInvalid", "Formulario invalido"));
      return;
    }

    this.validateRole = false;
    Swal.fire({
      allowOutsideClick: false,
      icon: "info",
      text: translateInstant(this.languageService.translate, "register.submitting", "Registrando..."),
    });
    Swal.showLoading(null);

    const payload = this.buildUpdatePayload();
    try {
      const res = await firstValueFrom(this.userService.updateUser(payload)) as ProfileUserResponse;
      if (res?.id) {
        this.user = res;
        this.createForm();
      }
      this.showSuccess(translateInstant(this.languageService.translate, "profile.updateSuccess", "Los datos se han actualizado con éxito"));
      this.syncSessionUser(res?.id ? res : payload);
      Swal.close();
      this.validateEmail = false;
    } catch (err: unknown) {
      this.handleValidateUserError(err);
      Swal.close();
    }
  }

  showError(message) {
    this.messageService.add({
      severity: "error",
      summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
      detail: message,
    });
  }
  showSuccess(message) {
    this.messageService.add({
      severity: "success",
      summary: translateInstant(this.languageService.translate, "message.titleSuccess", "Success"),
      detail: message,
    });
  }

  private hasSelectedRole(): boolean {
    return !!(this.checkTe || this.checkEx || this.checkEs);
  }

  /**
   * La descripcion de discapacidad solo debe ser requerida cuando el usuario
   * declara que si tiene discapacidad.
   */
  private syncDisabilityControlState() {
    const disabilityControl = this.angForm.controls["typeDisability"];

    if (!disabilityControl) {
      return;
    }

    if (!this.disability) {
      disabilityControl.setValue("Ninguna");
      disabilityControl.clearValidators();
      disabilityControl.updateValueAndValidity();
      return;
    }

    disabilityControl.setValidators([
      Validators.required,
      Validators.pattern(this.textOnlyPattern),
    ]);
    disabilityControl.updateValueAndValidity();
  }

  private handleValidateUserError(err: unknown) {
    const error = err as HttpErrorResponse & {
      error?: {
        message?: string;
      } & UserLocationErrors;
    };
    const message = error?.error?.message;
    const locationError = getLocationErrorMessage(this.languageService.translate, error?.error);

    if (locationError) {
      this.showError(locationError);
      return;
    }

    if (message == "Debe tener un email institucional") {
      if (this.roleUser) {
        this.showError(
          translateInstant(this.languageService.translate,
            "profile.institutionalRoleError",
            "No puedes ser Docente o Experto Colaborador por que debes estar registrado con un correo institucional"
          )
        );
      } else {
        this.showError(translateInstant(this.languageService.translate, "register.emailInstitutional", "El correo electronico debe ser institucional"));
        this.validateEmail = true;
      }
      return;
    }

    if (message == "This field must be unique.") {
      this.showError(translateInstant(this.languageService.translate, "register.emailinsertError", "El correo que ingreso ya se encuentra registrado"));
    }
  }

  /**
   * Traduce el formulario reactivo al contrato esperado por el backend.
   */
  private buildUpdatePayload(): UserGeneral {
    const payload: UserGeneral = {
      id: this.user.id,
      first_name: this.angForm.value.name,
      last_name: this.angForm.value.lastname,
      email: this.angForm.getRawValue().email,
      image: this.user.image,
      roles: [],
    };

    if (this.checkEs) {
      payload.roles.push("student");
      payload.education_levels = this.angForm.value.educacionL
        ? [this.angForm.value.educacionL]
        : [];
      payload.knowledge_areas = this.angForm.value.areasInteres;
      payload.preferences = this.angForm.value.areasPrefer;
      payload.has_disability = this.angForm.value.disability;
      payload.disability_description =
        this.angForm.value.disability === "yes"
          ? this.angForm.value.typeDisability
          : "Ninguna";
      payload.birthday = moment(this.angForm.value.calendar).format(
        "YYYY-MM-DD"
      );
    }

    if (this.checkTe) {
      payload.roles.push("teacher");
      const professionValue = this.angForm.value.profession;
      payload.professions = [
        professionValue?.[0]?.id ?? professionValue?.id ?? professionValue,
      ];
    }

    if (this.checkEx) {
      payload.roles.push("expert");
      payload.expert_level = this.angForm.value.levelExpertF;
      payload.web = this.angForm.value.url || null;
      payload.academic_profile = this.angForm.value.academic || null;
    }

    // Los seis campos, aunque provincia o ciudad vayan vacias: el backend
    // conserva los omitidos y quedaria la provincia del pais anterior (D8).
    if ((this.checkTe || this.checkEx) && this.angForm.value.location) {
      Object.assign(payload, this.angForm.value.location);
    }

    return payload;
  }

  /**
   * Mantiene sincronizada la sesion mostrada por el frontend luego de editar
   * datos personales o institucionales.
   */
  private syncSessionUser(userSnapshot: UserGeneral) {
    this.loginService.currentUser = userSnapshot;
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
    this.user.email = this.angForm.getRawValue().email;
    this.user.password = this.angForm.value.password;

    if (this.checkEs) {
      this.user.education_levels = this.angForm.value.educacionL
        ? [this.angForm.value.educacionL]
        : [];
      this.user.knowledge_areas = this.angForm.value.areasInteres;
      this.user.preferences = this.angForm.value.areasPrefer;

      this.user.has_disability = this.angForm.value.disability;
      this.user.disability_description = this.angForm.value.typeDisability;
      this.user.birthday = moment(this.angForm.value.calendar).format(
        "YYYY-MM-DD"
      );
    }

    if (this.checkTe) {
      const professionValue = this.angForm.value.profession;
      this.user.professions = [
        professionValue?.[0]?.id ?? professionValue?.id ?? professionValue,
      ];
    }
    if (this.checkEx) {
      this.user.collaboratingExpert = this.user.collaboratingExpert || {};
      this.user.expert_level = this.angForm.value.levelExpertF;
      this.user.collaboratingExpert.expert_level = this.angForm.value.levelExpertF;

      this.user.web = this.angForm.value.url || null;
      this.user.academic_profile = this.angForm.value.academic || null;
      this.user.collaboratingExpert.web = this.angForm.value.url || null;
      this.user.collaboratingExpert.academic_profile = this.angForm.value.academic || null;
    }
    if ((this.checkTe || this.checkEx) && this.angForm.value.location) {
      Object.assign(this.user, this.angForm.value.location);
    }
  }
  selectLevels(evt) {
    this.angForm.patchValue({
      educacionL: this.getSelectEventId(evt),
    });
  }

  selectProfesion(evt) {
    const professionId = this.getSelectEventId(evt);
    this.angForm.patchValue({
      profession: professionId,
    });
  }

  /**
   * Genera una previsualizacion local inmediata antes de subir la nueva foto.
   */
  onChangePicture(event: { target?: { files?: FileList | File[] | null; value?: string | null } } | null | undefined): void {
    const selectedFile = event?.target?.files?.[0] ?? null;

    if (!selectedFile) {
      return;
    }

    this.fileImage = selectedFile;
    const reader = new FileReader();

    reader.onload = (loadEvent: ProgressEvent<FileReader>) => {
      this.urlImageLocal = loadEvent.target?.result ?? null;
      this.imageSatusErr = false;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(selectedFile);
  }

  onCancelImage(): void {
    this.fileImage = null;
    this.urlImageLocal = null;
    this.imageSatusErr = false;
    if (this.inputFile?.nativeElement) {
      this.inputFile.nativeElement.value = "";
    }
    this.cdr.detectChanges();
  }
  async onLoadImage() {
    this.imageUpload = true;
    this.cdr.detectChanges();
    try {
      if (!this.fileImage || !this.user.id) {
        this.imageUpload = false;
        this.cdr.detectChanges();
        return;
      }

      const res = await firstValueFrom(this.userService.updateImage(this.fileImage, this.user.id)) as ProfileImageResponse;
      this.messageService.add({
        severity: "success",
        summary: translateInstant(this.languageService.translate, "message.titleSuccess", "Success"),
        detail: translateInstant(this.languageService.translate, "profile.imageUpdated", "La foto de perfil se ha cambiado con éxito"),
      });
      this.user.image = res.image;
      this.syncSessionUser(this.user);

      this.imageSatusErr = false;
      this.imageUpload = false;
      this.fileImage = null;
      this.urlImageLocal = null;
      if (this.inputFile?.nativeElement) {
        this.inputFile.nativeElement.value = "";
      }
      this.cdr.detectChanges();
    } catch (err) {
      this.imageSatusErr = true;
      this.imageUpload = false;
      this.cdr.detectChanges();
    }
  }

  get roleUser() {
    return this.loginService.validateRole("student");
  }

  public isControlInvalid(controlName: string): boolean {
    return controlInvalid(this.angForm.get(controlName));
  }

  public controlHasError(controlName: string, errorCode: string): boolean {
    return controlHasError(this.angForm.get(controlName), errorCode);
  }

  public getNameDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.controlHasError("name", "required")) {
      ids.push("name_label");
    }

    if (this.controlHasError("name", "pattern")) {
      ids.push("name_label1");
    }

    if (this.controlHasError("name", "minlength")) {
      ids.push("name_label2");
    }

    return ids.length ? ids.join(" ") : null;
  }

  public getDisabilityDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.controlHasError("typeDisability", "required")) {
      ids.push("disability");
    }

    if (this.controlHasError("typeDisability", "pattern")) {
      ids.push("disability1");
    }

    return ids.length ? ids.join(" ") : null;
  }

  public getAcademicDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.controlHasError("academic", "required")) {
      ids.push("academic_required");
    }

    return ids.length ? ids.join(" ") : null;
  }

  public getEmailDescribedBy(): string {
    const ids = ["email_hint"];

    if (this.email?.errors?.required && (this.email.dirty || this.email.touched)) {
      ids.push("email_required");
    }

    if (this.email?.errors?.pattern && !this.checkEx && !this.checkTe && (this.email.dirty || this.email.touched)) {
      ids.push("email_pattern");
    }

    if (this.validateEmail && (this.checkTe || this.checkEx)) {
      ids.push("email_invalid");
    }

    return ids.join(" ");
  }

  onEnterFigure() {
    this.inputFile?.nativeElement.click();
  }

  /**
   * Sincroniza el valor emitido por `duet-date-picker` con el formulario reactivo.
   */
  event_get_data_calendar(event: DuetDateChangeEvent) {
    this.angForm.controls['calendar'].setValue(
      event.detail.value
    );
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
}
