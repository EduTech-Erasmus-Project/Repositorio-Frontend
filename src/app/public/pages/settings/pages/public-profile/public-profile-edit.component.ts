import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { firstValueFrom } from "rxjs";
import {
  AcademicDegree,
  AcademicDegreeLevel,
  OwnPublicProfile,
  OwnPublicProfileUpdate,
  ProfileLink,
  ProfileLinkType,
  ProfileVisibility,
  ProfileVisibilityField,
} from "src/app/core/interfaces/PublicProfile";
import { translateInstant } from "src/app/core/utils/i18n.utils";
import { confirmDiscardChanges } from "src/app/core/utils/unsaved-changes.utils";
import { LeaveConfirmable } from "src/app/guards/unsaved-changes.guard";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { PublicProfileService } from "src/app/services/public-profile.service";
import {
  ACADEMIC_DEGREE_LEVELS,
  PROFILE_LINK_TYPES,
  PROFILE_VISIBILITY_FIELDS,
  normalizeProfileLinkUrl,
  PUBLIC_PROFILE_LIMITS,
  degreeYearValidator,
  profileLinkUrlValidator,
} from "./public-profile-form.utils";

type LinkForm = FormGroup<{
  type: FormControl<ProfileLinkType>;
  url: FormControl<string>;
  is_visible: FormControl<boolean>;
}>;

type DegreeForm = FormGroup<{
  level: FormControl<AcademicDegreeLevel>;
  title: FormControl<string>;
  institution: FormControl<string>;
  year: FormControl<number | null>;
  is_visible: FormControl<boolean>;
}>;

type TextListName = "research_lines" | "subjects";

/** Parte del perfil que cuenta para el avance, con la seccion a la que lleva. */
export interface ProfileProgressItem {
  label: string;
  done: boolean;
  target: string;
}

/**
 * Si la pagina publica ya se puede abrir: `empty` es perfil activo pero sin OA
 * publicos (el backend responde 404); `unknown` es un error al consultar.
 */
type PublicPageState = "checking" | "available" | "empty" | "unknown";

interface Option<T> {
  label: string;
  value: T;
  icon?: string;
}

/** Campos de texto simples que el backend puede rechazar por clave. */
const TEXT_FIELDS = ["headline", "faculty", "bio", "research_group"] as const;

/**
 * Edicion del perfil publico del docente autenticado (`settings/public-profile`).
 *
 * Responsabilidades:
 * - Cargar el perfil propio completo, tambien lo marcado como "Solo yo".
 * - Validar en el cliente con las mismas reglas del backend y guardar todo en
 *   un solo `PUT`, con las listas completas.
 * - Activar u ocultar el perfil con `PATCH { is_public }`, sin tocar lo demas.
 * - Mostrar los errores 400 del backend en el campo o el item que los causo.
 * - Avisar antes de salir con cambios sin guardar.
 */
@Component({
  selector: "app-public-profile-edit",
  templateUrl: "./public-profile-edit.component.html",
  styleUrls: ["./public-profile-edit.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  providers: [ConfirmationService],
})
export class PublicProfileEditComponent implements OnInit, LeaveConfirmable {
  readonly limits = PUBLIC_PROFILE_LIMITS;
  readonly linkTypes = PROFILE_LINK_TYPES;

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly saving = signal(false);
  readonly togglingPublic = signal(false);
  readonly isPublic = signal(true);
  readonly userKey = signal<string | null>(null);
  readonly publicPageState = signal<PublicPageState>("checking");
  /** Error del backend que no se puede ubicar en un campo (por ejemplo, enlaces repetidos). */
  readonly listErrors = signal<Partial<Record<"links" | "degrees", boolean>>>({});

  readonly visibilityOptions = signal<Option<ProfileVisibility>[]>([]);
  readonly itemVisibilityOptions = signal<Option<boolean>[]>([]);
  readonly degreeLevelOptions = signal<Option<AcademicDegreeLevel>[]>([]);
  /** Tipos de enlace que puede elegir cada fila: los libres mas el suyo. */
  readonly linkTypeOptions = signal<Option<ProfileLinkType>[][]>([]);
  /** Avance del perfil; se recalcula con cada cambio del formulario. */
  readonly progress = signal<ProfileProgressItem[]>([]);
  readonly progressDone = computed(() => this.progress().filter((item) => item.done).length);
  readonly progressPercent = computed(() =>
    this.progress().length ? Math.round((this.progressDone() / this.progress().length) * 100) : 0
  );

  /** Datos de la cuenta para la tarjeta lateral; la foto se cambia en "Mi perfil". */
  readonly account = inject(LoginService).user;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly publicProfileService = inject(PublicProfileService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly translate = inject(LanguageService).translate;
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly form = this.fb.group({
    headline: ["", Validators.maxLength(PUBLIC_PROFILE_LIMITS.headline)],
    faculty: ["", Validators.maxLength(PUBLIC_PROFILE_LIMITS.faculty)],
    bio: ["", Validators.maxLength(PUBLIC_PROFILE_LIMITS.bio)],
    research_group: ["", Validators.maxLength(PUBLIC_PROFILE_LIMITS.researchGroup)],
    research_lines: this.fb.array<FormControl<string>>([]),
    subjects: this.fb.array<FormControl<string>>([]),
    field_visibility: this.fb.group(
      Object.fromEntries(
        PROFILE_VISIBILITY_FIELDS.map((field) => [field, this.fb.control<ProfileVisibility>("public")])
      ) as Record<ProfileVisibilityField, FormControl<ProfileVisibility>>
    ),
    links: this.fb.array<LinkForm>([]),
    degrees: this.fb.array<DegreeForm>([]),
  });

  /** Ultimo perfil guardado; "Descartar cambios" vuelve a el. */
  private savedProfile: OwnPublicProfile | null = null;

  get researchLines(): FormArray<FormControl<string>> {
    return this.form.controls.research_lines;
  }

  get subjects(): FormArray<FormControl<string>> {
    return this.form.controls.subjects;
  }

  get links(): FormArray<LinkForm> {
    return this.form.controls.links;
  }

  get degrees(): FormArray<DegreeForm> {
    return this.form.controls.degrees;
  }

  ngOnInit(): void {
    this.buildOptions();
    this.publishBreadcrumb();
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.buildOptions();
      this.publishBreadcrumb();
    });
    this.links.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshLinkTypeOptions());
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshProgress());
    void this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);
    try {
      const profile = await firstValueFrom(this.publicProfileService.getOwnProfile());
      this.applyProfile(profile);
      void this.checkPublicPage();
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  addTextItem(list: TextListName): void {
    const array = this.form.controls[list];
    const [max, maxLength] = list === "research_lines"
      ? [PUBLIC_PROFILE_LIMITS.researchLines, PUBLIC_PROFILE_LIMITS.researchLine]
      : [PUBLIC_PROFILE_LIMITS.subjects, PUBLIC_PROFILE_LIMITS.subject];
    if (array.length < max) {
      array.push(this.fb.control("", Validators.maxLength(maxLength)));
      this.form.markAsDirty();
      this.focusAfterRender(`ppe-${list}-${array.length - 1}`);
    }
  }

  removeTextItem(list: TextListName, index: number): void {
    this.form.controls[list].removeAt(index);
    this.form.markAsDirty();
  }

  addLink(): void {
    const used = new Set(this.links.controls.map((link) => link.controls.type.value));
    const type = PROFILE_LINK_TYPES.find((item) => !used.has(item));
    if (type) {
      this.links.push(this.createLink({ type, url: "", is_visible: true }));
      this.form.markAsDirty();
      this.focusAfterRender(`ppe-link-url-${this.links.length - 1}`);
    }
  }

  removeLink(index: number): void {
    this.links.removeAt(index);
    this.form.markAsDirty();
  }

  /** Mueve un enlace arriba (-1) o abajo (+1); el orden se guarda como `order`. */
  moveLink(index: number, step: -1 | 1): void {
    const target = index + step;
    if (target < 0 || target >= this.links.length) {
      return;
    }
    const link = this.links.at(index);
    this.links.removeAt(index, { emitEvent: false });
    this.links.insert(target, link);
    this.form.markAsDirty();
  }

  addDegree(): void {
    if (this.degrees.length < PUBLIC_PROFILE_LIMITS.degrees) {
      this.degrees.push(this.createDegree({ level: "third", title: "", institution: "", year: null, is_visible: true }));
      this.form.markAsDirty();
      this.focusAfterRender(`ppe-degree-title-${this.degrees.length - 1}`);
    }
  }

  removeDegree(index: number): void {
    this.degrees.removeAt(index);
    this.form.markAsDirty();
  }

  /** Pregunta antes de salir de la pagina si hay cambios sin guardar. */
  confirmLeave(): boolean | Promise<boolean> {
    return this.form.dirty && !this.saving()
      ? confirmDiscardChanges(this.confirmationService, this.translate)
      : true;
  }

  /** Al recargar o cerrar la pestana el navegador muestra su propio aviso. */
  @HostListener("window:beforeunload", ["$event"])
  warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.form.dirty) {
      event.preventDefault();
    }
  }

  /** Lleva a la seccion de un punto del avance y enfoca su primer campo. */
  goToSection(target: string): void {
    const section = this.elementRef.nativeElement.querySelector<HTMLElement>(`#${target}`);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
    section?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
  }

  discardChanges(): void {
    if (this.savedProfile) {
      this.applyProfile(this.savedProfile);
    }
  }

  /**
   * Guarda todo el perfil en un `PUT`. Las filas de texto vacias se quitan
   * antes, para que las posiciones de los errores del backend coincidan con
   * las del formulario.
   */
  async save(): Promise<void> {
    this.removeEmptyTextItems();
    this.listErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showToast("error", "publicProfileEdit.messages.invalid");
      return;
    }

    this.saving.set(true);
    try {
      const profile = await firstValueFrom(this.publicProfileService.saveOwnProfile(this.buildPayload()));
      this.applyProfile(profile);
      this.showToast("success", "publicProfileEdit.messages.saved");
    } catch (err) {
      const error = err as HttpErrorResponse;
      const located = error?.status === 400 && this.applyServerErrors(error.error);
      this.form.markAllAsTouched();
      this.showToast("error", located ? "publicProfileEdit.messages.invalid" : "publicProfileEdit.messages.saveError");
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Activa u oculta todo el perfil al instante. Si falla, el interruptor
   * vuelve a su estado anterior.
   */
  async togglePublic(isPublic: boolean): Promise<void> {
    const previous = this.isPublic();
    this.isPublic.set(isPublic);
    this.togglingPublic.set(true);
    try {
      const profile = await firstValueFrom(this.publicProfileService.patchOwnProfile({ is_public: isPublic }));
      this.isPublic.set(profile.is_public);
      this.userKey.set(profile.user_key ?? this.userKey());
      void this.checkPublicPage();
      this.showToast("success", isPublic ? "publicProfileEdit.messages.shown" : "publicProfileEdit.messages.hidden");
    } catch {
      this.isPublic.set(previous);
      this.showToast("error", "publicProfileEdit.messages.saveError");
    } finally {
      this.togglingPublic.set(false);
    }
  }

  /** Error de validacion a mostrar en un control, en orden de prioridad. */
  errorKey(control: AbstractControlLike): { key: string; params?: Record<string, unknown> } | null {
    if (!control.errors || !(control.touched || control.dirty)) {
      return null;
    }
    const errors = control.errors;
    if (errors["required"]) {
      return { key: "publicProfileEdit.errors.required" };
    }
    if (errors["maxlength"]) {
      return { key: "publicProfileEdit.errors.maxLength", params: { max: errors["maxlength"].requiredLength } };
    }
    if (errors["https"]) {
      return { key: "publicProfileEdit.errors.https" };
    }
    if (errors["domain"]) {
      return { key: "publicProfileEdit.errors.domain", params: errors["domain"] };
    }
    if (errors["orcid"]) {
      return { key: "publicProfileEdit.errors.orcid" };
    }
    if (errors["orcidChecksum"]) {
      return { key: "publicProfileEdit.errors.orcidChecksum" };
    }
    if (errors["year"]) {
      return { key: "publicProfileEdit.errors.year", params: errors["year"] };
    }
    return { key: "publicProfileEdit.errors.server" };
  }

  private applyProfile(profile: OwnPublicProfile): void {
    this.savedProfile = profile;
    this.isPublic.set(profile.is_public ?? true);
    this.userKey.set(profile.user_key ?? null);
    this.listErrors.set({});

    this.form.patchValue({
      headline: profile.headline ?? "",
      faculty: profile.faculty ?? "",
      bio: profile.bio ?? "",
      research_group: profile.research_group ?? "",
      field_visibility: profile.field_visibility ?? {},
    });
    this.setTextItems("research_lines", profile.research_lines ?? [], PUBLIC_PROFILE_LIMITS.researchLine);
    this.setTextItems("subjects", profile.subjects ?? [], PUBLIC_PROFILE_LIMITS.subject);

    this.links.clear({ emitEvent: false });
    [...(profile.links ?? [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((link) => this.links.push(this.createLink(link), { emitEvent: false }));
    this.degrees.clear({ emitEvent: false });
    (profile.degrees ?? []).forEach((degree) => this.degrees.push(this.createDegree(degree), { emitEvent: false }));

    this.refreshLinkTypeOptions();
    this.refreshProgress();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  /**
   * Consulta la pagina publica propia para saber si mostrar "Ver mi perfil
   * publico" o el aviso de que falta publicar un OA. Solo aplica con el perfil activo.
   */
  private async checkPublicPage(): Promise<void> {
    const userKey = this.userKey();
    if (!userKey || !this.isPublic()) {
      return;
    }
    this.publicPageState.set("checking");
    try {
      await firstValueFrom(this.publicProfileService.getAuthor(userKey));
      this.publicPageState.set("available");
    } catch (err) {
      this.publicPageState.set((err as HttpErrorResponse)?.status === 404 ? "empty" : "unknown");
    }
  }

  private setTextItems(list: TextListName, values: string[], maxLength: number): void {
    const array = this.form.controls[list];
    array.clear({ emitEvent: false });
    values.forEach((value) => array.push(this.fb.control(value, Validators.maxLength(maxLength)), { emitEvent: false }));
  }

  private createLink(link: Pick<ProfileLink, "type" | "url" | "is_visible">): LinkForm {
    const group: LinkForm = this.fb.group({
      type: this.fb.control(link.type),
      url: this.fb.control(link.url, [
        Validators.required,
        Validators.maxLength(PUBLIC_PROFILE_LIMITS.linkUrl),
        profileLinkUrlValidator,
      ]),
      is_visible: this.fb.control(link.is_visible ?? true),
    });
    // La URL se valido antes de tener grupo (sin `type`); se revalida ya armada
    // y cada vez que cambia el tipo.
    group.controls.url.updateValueAndValidity({ emitEvent: false });
    group.controls.type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => group.controls.url.updateValueAndValidity());
    return group;
  }

  private createDegree(degree: AcademicDegree): DegreeForm {
    const textValidators = [Validators.required, Validators.maxLength(PUBLIC_PROFILE_LIMITS.degreeText)];
    return this.fb.group({
      level: this.fb.control(degree.level),
      title: this.fb.control(degree.title, textValidators),
      institution: this.fb.control(degree.institution, textValidators),
      year: this.fb.control<number | null>(degree.year ?? null, degreeYearValidator),
      is_visible: this.fb.control(degree.is_visible ?? true),
    });
  }

  private removeEmptyTextItems(): void {
    (["research_lines", "subjects"] as const).forEach((list) => {
      const array = this.form.controls[list];
      for (let index = array.length - 1; index >= 0; index--) {
        if (!array.at(index).value.trim()) {
          array.removeAt(index);
        }
      }
    });
  }

  private buildPayload(): OwnPublicProfileUpdate {
    const value = this.form.getRawValue();
    return {
      headline: value.headline.trim(),
      faculty: value.faculty.trim(),
      bio: value.bio.trim(),
      research_group: value.research_group.trim(),
      research_lines: value.research_lines.map((item) => item.trim()),
      subjects: value.subjects.map((item) => item.trim()),
      field_visibility: value.field_visibility,
      links: value.links.map((link, index) => ({
        type: link.type,
        url: normalizeProfileLinkUrl(link.type, link.url),
        order: index + 1,
        is_visible: link.is_visible,
      })),
      degrees: value.degrees.map((degree) => ({
        level: degree.level,
        title: degree.title.trim(),
        institution: degree.institution.trim(),
        year: degree.year ?? null,
        is_visible: degree.is_visible,
      })),
    };
  }

  /**
   * Marca con `server` cada control que el backend rechazo. Los errores de
   * listas llegan alineados por posicion (`[{}, {"url": [...]}]`) o, para las
   * listas de texto, como `{"0": [...]}`. Devuelve `true` si ubico alguno.
   */
  private applyServerErrors(body: unknown): boolean {
    if (!body || typeof body !== "object") {
      return false;
    }
    const errors = body as Record<string, unknown>;
    let located = false;

    TEXT_FIELDS.forEach((field) => {
      if (errors[field]) {
        this.form.controls[field].setErrors({ server: true });
        located = true;
      }
    });

    (["research_lines", "subjects"] as const).forEach((list) => {
      const listErrors = errors[list];
      if (listErrors && typeof listErrors === "object" && !Array.isArray(listErrors)) {
        Object.keys(listErrors).forEach((index) => {
          this.form.controls[list].at(Number(index))?.setErrors({ server: true });
          located = true;
        });
      }
    });

    (["links", "degrees"] as const).forEach((list) => {
      const listErrors = errors[list];
      if (!Array.isArray(listErrors)) {
        return;
      }
      listErrors.forEach((itemErrors, index) => {
        if (typeof itemErrors === "string") {
          this.listErrors.update((current) => ({ ...current, [list]: true }));
          located = true;
          return;
        }
        const group = this.form.controls[list].at(index) as FormGroup | undefined;
        Object.keys((itemErrors as Record<string, unknown>) ?? {}).forEach((field) => {
          const control = group?.get(field === "non_field_errors" ? "url" : field);
          if (control) {
            control.setErrors({ server: true });
            located = true;
          }
        });
      });
    });

    return located;
  }

  private refreshLinkTypeOptions(): void {
    const used = this.links.controls.map((link) => link.controls.type.value);
    this.linkTypeOptions.set(
      used.map((ownType) =>
        PROFILE_LINK_TYPES
          .filter((type) => type === ownType || !used.includes(type))
          .map((type) => ({ value: type, label: this.instant(`authorProfile.linkTypes.${type}`, type) }))
      )
    );
  }

  private refreshProgress(): void {
    const value = this.form.getRawValue();
    const filled = (text: string) => text.trim().length > 0;
    this.progress.set([
      { label: "authorProfile.headline", done: filled(value.headline), target: "ppe-section-presentation" },
      { label: "authorProfile.about", done: filled(value.bio), target: "ppe-section-presentation" },
      { label: "authorProfile.faculty", done: filled(value.faculty), target: "ppe-section-academic" },
      { label: "authorProfile.researchLines", done: value.research_lines.some(filled), target: "ppe-section-research" },
      { label: "authorProfile.degrees", done: value.degrees.length > 0, target: "ppe-section-degrees" },
      { label: "authorProfile.links", done: value.links.length > 0, target: "ppe-section-links" },
    ]);
  }

  private buildOptions(): void {
    this.visibilityOptions.set([
      { value: "public", label: this.instant("publicProfileEdit.visibility.public", "Público"), icon: "pi pi-globe" },
      { value: "private", label: this.instant("publicProfileEdit.visibility.private", "Solo yo"), icon: "pi pi-lock" },
    ]);
    this.itemVisibilityOptions.set([
      { value: true, label: this.instant("publicProfileEdit.visibility.public", "Público"), icon: "pi pi-globe" },
      { value: false, label: this.instant("publicProfileEdit.visibility.private", "Solo yo"), icon: "pi pi-lock" },
    ]);
    this.degreeLevelOptions.set(
      ACADEMIC_DEGREE_LEVELS.map((level) => ({
        value: level,
        label: this.instant(`authorProfile.degreeLevels.${level}`, level),
      }))
    );
    this.refreshLinkTypeOptions();
  }

  /**
   * Lleva el foco al campo de la fila recien agregada; si quedara en el boton
   * "Agregar", la barra espaciadora agregaria otra fila al escribir.
   */
  private focusAfterRender(inputId: string): void {
    afterNextRender(
      () => this.elementRef.nativeElement.querySelector<HTMLElement>(`#${inputId}`)?.focus(),
      { injector: this.injector }
    );
  }

  /** Mismo breadcrumb que las demas paginas de configuracion. */
  private publishBreadcrumb(): void {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: this.instant("menu.settings", "Configuración") },
      { label: this.instant("menu.sideMenu.publicProfile", "Perfil público"), routerLink: ["/settings/public-profile"] },
    ]);
  }

  private showToast(severity: "success" | "error", detailKey: string): void {
    this.messageService.add({
      severity,
      summary: this.instant(severity === "success" ? "message.titleSuccess" : "message.titleError", ""),
      detail: this.instant(detailKey, ""),
    });
  }

  private instant(key: string, fallback: string): string {
    return translateInstant(this.translate, key, fallback);
  }
}

/** Lo que `errorKey` necesita de un control (tambien sirve para grupos). */
interface AbstractControlLike {
  errors: Record<string, any> | null;
  touched: boolean;
  dirty: boolean;
}
