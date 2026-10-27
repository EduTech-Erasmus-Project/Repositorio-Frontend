import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy } from "@angular/core";
import { MessageService } from "primeng/api";
import * as QRCode from "qrcode";
import { LoginService } from "../../../services/login.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { LearningObjectFile } from "src/app/core/interfaces/LearningObjectFile";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { shouldDisplayLearningObjectMenu } from "src/app/core/utils/learning-object-preview";
import { firstValueFrom, Subscription } from "rxjs";
import { InteractionReferenceService } from "src/app/services/interaction-reference.service";
import { FocusOrigin, captureFocusOrigin, restoreFocusOrigin } from "src/app/core/utils/accessibility-focus";
import { LanguageService } from "src/app/services/language.service";
import { translateInstant } from "src/app/core/utils/i18n.utils";
import { openTrustedExternalUrl } from "src/app/core/utils/external-navigation.utils";
import { isOwnLearningObject } from "src/app/core/utils/learning-object-owner.utils";
import {
  LearningObjectDownloadCountResponse,
  LearningObjectInteractionResponse,
  LearningObjectViewCountResponse,
} from "src/app/core/interfaces/api-contracts";

type FullscreenElement = HTMLElement & {
  requestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
};

type FullscreenDocument = Document & {
  msExitFullscreen?: () => void;
  mozCancelFullScreen?: () => void;
  webkitExitFullscreen?: () => void;
  msFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
};

type ShareOption = {
  label: string;
  icon: string;
  url: string;
  external: boolean;
};

/**
 * Controla el visor principal del OA y sus interacciones de usuario autenticado.
 *
 * Responsabilidades:
 * - Sincronizar likes, descargas, vistas y dialogs de evaluacion del recurso.
 * - Adaptar la vista cuando el OA requiere menu integrado de navegacion.
 * - Persistir referencias minimas de tracking local usadas por el backend.
 */
@Component({
    selector: "app-web-view",
    templateUrl: "./web-view.component.html",
    styleUrls: ["./web-view.component.scss"],
    standalone: false
})
export class WebViewComponent implements OnInit, OnDestroy {
  @ViewChild("webView") webView!: ElementRef<HTMLElement>;
  @ViewChild("viewer") viewer!: ElementRef<HTMLElement>;
  @Input() object!: ObjectLearning;
  @Output() commentEmit1 = new EventEmitter<boolean>();

  public fullScreen = false;
  public displayFormRating = false;
  public displayFormRatingExpert = false;
  public displayFormRatingExpertUpdate = false;

  public subscribes: Subscription[] = [];
  public liked = false;
  private interaction: LearningObjectInteractionResponse | null = null;
  public flagQuestionsEx = false;
  public flagQuestionsExNumber = -1;
  public expertEvaluationStateResolved = false;

  public flagConfirm = false;

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>
  public flagQuestionsEst = false;
  public flagQuestionsEstNumber = -1;
  public studentEvaluationStateResolved = false;

  public displayFormRatingStudent = false;
  public displayFormRatingStudentUpdate = false;
  public displayShareDialog = false;
  public shareOptions: ShareOption[] = [];
  public shareQrCodeDataUrl = "";
  public shareQrCodeError = false;
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>

  public countViews: number = 0;
  public countDownloads: number = 0;
  /** OA cuya vista ya se registro en esta pantalla; las demas recargas solo leen. */
  private viewRegisteredFor: number | null = null;

  public youNeedMenu = false;
  private lastDialogFocusOrigin: FocusOrigin | null = null;
  private readonly fullscreenChangeHandler = () => this.syncFullscreenState();

  constructor(
    private loginService: LoginService,
    private learningObject: LearningObjectService,
    private messageService: MessageService,
    private interactionReference: InteractionReferenceService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef,
  ) {

    const interactionOA = this.learningObject.selectedLearningObject$.subscribe(
      async res => {
        if (res) {
          this.object = res;
          await this.refreshObjectContext();
          this.cdr.detectChanges();
        }
      }
    );
    this.subscribes.push(interactionOA);
  }


  ngOnDestroy(): void {
    this.removeFullscreenListeners();
    this.subscribes.forEach((subscription) => {
      if (subscription != undefined) {
        subscription.unsubscribe();
      }
    });
  }

  /** `user_key` del autor para enlazar a `/author/:userKey`. */
  get authorKey(): string | null {
    return this.object?.user_created?.user_key ?? null;
  }

  ngOnInit(): void {
    this.addFullscreenListeners();
    this.syncPreviewState();
    void this.loadData();
    void this.reloadEvaluationState();
  }

  async loadDataExpertEvaluation() {
    if (this.canEvaluateAsExpert) {
      this.expertEvaluationStateResolved = false;
      try {
        const res = await firstValueFrom(
          this.learningObject.getObjectResultsEvaluation(this.object.id)
        );
        this.setEvaluationFlag("expert", res.length > 0);
        this.expertEvaluationStateResolved = true;
      } catch {
        this.resetEvaluationFlag("expert");
        this.expertEvaluationStateResolved = false;
      }
      return;
    }

    this.resetEvaluationFlag("expert");
    this.expertEvaluationStateResolved = false;
  }

  async loadData() {
    if (this.loginService.user && this.canLikeObject) {
      try {
        const res = await firstValueFrom(
          this.learningObject.validateLike(this.object.id)
        );
        this.liked = res.liked;
        this.interaction = res;
      } catch {
        this.liked = false;
      }
    }
    await this.refreshObjectContext();
    this.cdr.detectChanges();
  }

  /**
   * Registra una vista por cada OA abierto y muestra el total. El backend
   * cuenta una vez por referencia, OA y dia, asi que recargar no infla el
   * contador; las recargas de la misma pantalla solo leen el total.
   */
  private async loadViews() {
    const learningObjectId = this.object?.id;
    if (!learningObjectId) {
      return;
    }

    if (this.viewRegisteredFor !== learningObjectId) {
      this.viewRegisteredFor = learningObjectId;
      try {
        const reference = await this.interactionReference.get();
        const res = await firstValueFrom(
          this.learningObject.registerView(learningObjectId, reference)
        );
        this.countViews = res[0]?.view ?? this.countViews;
        return;
      } catch {
        // Si no se pudo registrar, al menos se muestra el total.
      }
    }

    try {
      const res = await firstValueFrom(this.learningObject.getViewedCount(learningObjectId));
      this.countViews = res[0]?.view ?? 0;
    } catch {
      // El backend responde error si el OA todavia no tiene contador.
      this.countViews = 0;
    }
  }

  /**
   * Obtener numero de descargas que tiene el objeto de aprendizaje 
   */
  private async getNumberOfDownloads() {
    try {
      const res = await firstValueFrom(
        this.learningObject.getdownloadCount(this.object.id)
      );
        this.countDownloads = res.number;
    } catch {
      this.countDownloads = 0;
    }
  }


  openFullscreen() {
    const elem = (this.viewer?.nativeElement || this.webView.nativeElement) as FullscreenElement;
    const requestFullscreen =
      elem.requestFullscreen?.bind(elem) ||
      elem.msRequestFullscreen?.bind(elem) ||
      elem.mozRequestFullScreen?.bind(elem) ||
      elem.webkitRequestFullscreen?.bind(elem);

    if (!requestFullscreen) {
      return;
    }

    this.fullScreen = true;

    Promise.resolve(requestFullscreen()).catch(() => {
      this.fullScreen = false;
      this.cdr.detectChanges();
    });
  }

  closeFullscreen() {
    const documentRef = document as FullscreenDocument;
    const exitFullscreen =
      document.exitFullscreen?.bind(document) ||
      documentRef.msExitFullscreen?.bind(documentRef) ||
      documentRef.mozCancelFullScreen?.bind(documentRef) ||
      documentRef.webkitExitFullscreen?.bind(documentRef);

    if (!exitFullscreen) {
      this.fullScreen = false;
      this.cdr.detectChanges();
      return;
    }

    Promise.resolve(exitFullscreen())
      .catch(() => undefined)
      .finally(() => {
        this.syncFullscreenState();
      });
  }

  private addFullscreenListeners(): void {
    document.addEventListener("fullscreenchange", this.fullscreenChangeHandler);
    document.addEventListener("webkitfullscreenchange", this.fullscreenChangeHandler);
    document.addEventListener("mozfullscreenchange", this.fullscreenChangeHandler);
    document.addEventListener("MSFullscreenChange", this.fullscreenChangeHandler);
  }

  private removeFullscreenListeners(): void {
    document.removeEventListener("fullscreenchange", this.fullscreenChangeHandler);
    document.removeEventListener("webkitfullscreenchange", this.fullscreenChangeHandler);
    document.removeEventListener("mozfullscreenchange", this.fullscreenChangeHandler);
    document.removeEventListener("MSFullscreenChange", this.fullscreenChangeHandler);
  }

  private syncFullscreenState(): void {
    const fullscreenElement = this.getActiveFullscreenElement();
    const viewerElement = this.viewer?.nativeElement;
    const webViewElement = this.webView?.nativeElement;

    this.fullScreen = fullscreenElement === viewerElement || fullscreenElement === webViewElement;
    this.cdr.detectChanges();
  }

  private getActiveFullscreenElement(): Element | null {
    const documentRef = document as FullscreenDocument;

    return (
      document.fullscreenElement ||
      documentRef.msFullscreenElement ||
      documentRef.mozFullScreenElement ||
      documentRef.webkitFullscreenElement ||
      null
    );
  }

  onDownloadFile(url: string | LearningObjectFile | null | undefined) {
    const targetUrl = this.resolveDownloadUrl(url);

    if (!targetUrl) {
      return;
    }

    if (this.loginService.user && (this.roleUserStudent || this.roleUserTeacher || this.roleUserExpert)) {
      this.onDonwloaded();
      if (!openTrustedExternalUrl(targetUrl)) {
        this.showInvalidExternalUrlError();
      }
    } else {
      this.messageService.add(
        {
          severity: "error",
          summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
          detail: translateInstant(this.languageService.translate, "object.loginRequiredAction", "Debe iniciar sesion para realizar esta accion"),
        },
      );
    }
  }

  private showInvalidExternalUrlError(): void {
    this.messageService.add({
      severity: "error",
      summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
      detail: translateInstant(
        this.languageService.translate,
        "object.invalidExternalUrl",
        "La URL del recurso no es valida o no esta permitida."
      ),
    });
  }

  public onShareObject(): void {
    if (this.shouldUseNativeShare()) {
      void navigator.share({
        title: this.getShareTitle(),
        text: this.getShareMessage(),
        url: this.getPublicObjectUrl(),
      }).catch((error: unknown) => {
        if ((error as DOMException)?.name !== "AbortError") {
          this.openShareDialog();
        }
      });
      return;
    }

    this.openShareDialog();
  }

  public async copyShareLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getPublicObjectUrl());
      this.messageService.add({
        severity: "success",
        summary: translateInstant(this.languageService.translate, "message.titleSuccess", "Correcto"),
        detail: translateInstant(this.languageService.translate, "object.shareLinkCopied", "Enlace copiado al portapapeles"),
      });
      this.displayShareDialog = false;
    } catch {
      this.messageService.add({
        severity: "error",
        summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
        detail: translateInstant(this.languageService.translate, "object.shareLinkCopyError", "No se pudo copiar el enlace"),
      });
    }
  }

  public async copyShareQrCode(): Promise<void> {
    const clipboard = navigator.clipboard as Clipboard & {
      write?: (data: any[]) => Promise<void>;
    };
    const clipboardItemConstructor = (window as any).ClipboardItem;

    if (!this.shareQrCodeDataUrl || typeof clipboard?.write !== "function" || typeof clipboardItemConstructor !== "function") {
      this.messageService.add({
        severity: "error",
        summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
        detail: translateInstant(
          this.languageService.translate,
          "object.shareQrCopyUnsupported",
          "Tu navegador no permite copiar el codigo QR como imagen."
        ),
      });
      return;
    }

    try {
      const response = await fetch(this.shareQrCodeDataUrl);
      const blob = await response.blob();

      await clipboard.write([
        new clipboardItemConstructor({
          [blob.type || "image/png"]: blob,
        }),
      ]);

      this.messageService.add({
        severity: "success",
        summary: translateInstant(this.languageService.translate, "message.titleSuccess", "Correcto"),
        detail: translateInstant(this.languageService.translate, "object.shareQrCopied", "Codigo QR copiado al portapapeles"),
      });
    } catch {
      this.messageService.add({
        severity: "error",
        summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
        detail: translateInstant(this.languageService.translate, "object.shareQrCopyError", "No se pudo copiar el codigo QR"),
      });
    }
  }

  public getSharePreviewMessage(): string {
    return this.getShareMessage();
  }

  private openShareDialog(): void {
    this.shareOptions = this.buildShareOptions();
    this.shareQrCodeDataUrl = "";
    this.shareQrCodeError = false;
    this.displayShareDialog = true;
    void this.generateShareQrCode();
  }

  private shouldUseNativeShare(): boolean {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      return false;
    }

    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth <= 900 || window.matchMedia?.("(pointer: coarse)")?.matches === true;
  }

  private buildShareOptions(): ShareOption[] {
    const title = this.getShareTitle();
    const url = this.getPublicObjectUrl();
    const message = this.getShareMessage();
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    const encodedMessage = encodeURIComponent(message);

    return [
      {
        label: "WhatsApp",
        icon: "pi pi-whatsapp",
        url: `https://api.whatsapp.com/send?text=${encodedMessage}`,
        external: true,
      },
      {
        label: "Facebook",
        icon: "pi pi-facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        external: true,
      },
      {
        label: "LinkedIn",
        icon: "pi pi-linkedin",
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        external: true,
      },
      {
        label: "Telegram",
        icon: "pi pi-send",
        url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
        external: true,
      },
      {
        label: translateInstant(this.languageService.translate, "object.shareEmail", "Correo"),
        icon: "pi pi-envelope",
        url: `mailto:?subject=${encodedTitle}&body=${encodedMessage}`,
        external: false,
      },
      {
        label: "Reddit",
        icon: "pi pi-reddit",
        url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        external: true,
      },
      {
        label: "X",
        icon: "pi pi-twitter",
        url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        external: true,
      },
    ];
  }

  private getShareMessage(): string {
    return [
      translateInstant(
        this.languageService.translate,
        "object.shareMessageIntro",
        "Mira este objeto de aprendizaje del ROA de la Universidad Politecnica Salesiana:"
      ),
      "",
      `${translateInstant(this.languageService.translate, "object.shareTitle", "Titulo")}: ${this.getShareTitle()}`,
      `${translateInstant(this.languageService.translate, "object.shareAuthor", "Autor")}: ${this.getObjectAuthor()}`,
      this.getPublicObjectUrl(),
    ].join("\n");
  }

  private async generateShareQrCode(): Promise<void> {
    try {
      this.shareQrCodeDataUrl = await QRCode.toDataURL(this.getPublicObjectUrl(), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 180,
        color: {
          dark: "#1d3f5a",
          light: "#ffffff",
        },
      });
      this.shareQrCodeError = false;
      this.cdr.detectChanges();
    } catch {
      this.shareQrCodeDataUrl = "";
      this.shareQrCodeError = true;
      this.cdr.detectChanges();
    }
  }

  private getShareTitle(): string {
    return this.object?.general_title?.trim() || translateInstant(
      this.languageService.translate,
      "object.shareUntitled",
      "Objeto de aprendizaje"
    );
  }

  private getObjectAuthor(): string {
    const author = [
      this.object?.user_created?.first_name,
      this.object?.user_created?.last_name,
    ].filter(Boolean).join(" ").trim();

    return author || translateInstant(this.languageService.translate, "object.shareUnknownAuthor", "Autor no disponible");
  }

  private getPublicObjectUrl(): string {
    if (typeof window === "undefined") {
      return "";
    }

    if (this.object?.slug) {
      return `${window.location.origin}/#/object/${this.object.slug}`;
    }

    return window.location.href;
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  /** Un experto no califica los OA que él mismo subió como docente. */
  get canEvaluateAsExpert() {
    return this.roleExpert && !isOwnLearningObject(this.object, this.loginService.user);
  }

  get isloged() {
    return this.loginService.user;
  }

  get roleUserStudent() {
    return this.loginService.validateRole("student");
  }

  get roleUserExpert() {
    return this.loginService.validateRole("expert");
  }

  get roleUserTeacher() {
    return this.loginService.validateRole("teacher");
  }

  get canLikeObject() {
    return this.object?.public !== false && (this.roleUserStudent || this.roleUserExpert || this.roleUserTeacher);
  }

  public openExpertDialog(mode: "create" | "update", event?: Event, triggerId?: string) {
    this.lastDialogFocusOrigin = captureFocusOrigin(event, triggerId);
    this.displayFormRatingExpert = mode === "create";
    this.displayFormRatingExpertUpdate = mode === "update";
  }

  public openStudentDialog(mode: "create" | "update", event?: Event, triggerId?: string) {
    this.lastDialogFocusOrigin = captureFocusOrigin(event, triggerId);
    this.displayFormRatingStudent = mode === "create";
    this.displayFormRatingStudentUpdate = mode === "update";
  }

  public restoreDialogFocus() {
    const origin = this.lastDialogFocusOrigin;
    this.lastDialogFocusOrigin = null;
    restoreFocusOrigin(origin);
  }

  coutComment(evt: boolean) {
    this.displayFormRatingExpert = evt;
    if (this.flagQuestionsEx == true) {
      this.displayFormRatingExpertUpdate = evt;
      this.commentEmit1.emit(true);
    }
  }

  coutComment1(evt: boolean) {
    if (evt == true) {
      this.flagConfirm = true;
      this.displayFormRatingExpert = false;
      this.reloadEvaluationState();
      // Igual que al editar (coutComment): la página del OA refresca la
      // evaluación visible, la valoración y la columna lateral.
      this.commentEmit1.emit(true);
    } else {
      this.flagConfirm = false;
    }
  }

  async onLike() {
    this.liked = !this.liked;

    if (this.interaction?.liked == undefined) {
      await this.createILike();
    } else {
      this.interaction.liked = this.liked;
      await this.updateLikeInteraction();
    }

    this.cdr.detectChanges();
  }

  /**
   *Funcion para crear la funcionalidad de me gusta
   */
  private async createILike() {

    this.interaction = {
      liked: this.liked,
      learning_object: this.object.id
    };

    try {
      const res = await firstValueFrom(
        this.learningObject.interactionView(this.interaction)
      );
        this.interaction = res;
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
        detail: translateInstant(this.languageService.translate, "object.interactionSaveError", "No se pudo guardar la interaccion")
      });
    }
  }

  /** Registra la descarga con la referencia del navegador y refresca el total. */
  public async onDonwloaded() {
    try {
      const reference = await this.interactionReference.get();
      const res = await firstValueFrom(
        this.learningObject.registerDownload(this.object.id, reference)
      );
      this.interaction = res[0] ?? this.interaction;
      await this.getNumberOfDownloads();
    } catch {
    }

    this.cdr.detectChanges();
  }

  coutCommentstudent(evt: boolean) {
    this.displayFormRatingStudent = false;

    if (evt === true) {
      this.flagQuestionsEst = true;
      this.flagQuestionsEstNumber = 1;
    }
  }

  coutComments(evt: boolean) {
    this.displayFormRatingStudent = evt;
    if (this.flagQuestionsEst == true) {
      this.displayFormRatingStudentUpdate = evt;
    }
  }

  async loadDataStudentEvaluation() {
    if (this.roleUserStudent) {
      this.studentEvaluationStateResolved = false;
      try {
        const res = await firstValueFrom(
          this.learningObject.getObjectResultsEvaluationStudent(this.object.id)
        );
        this.setEvaluationFlag("student", res.length > 0);
        this.studentEvaluationStateResolved = true;
      } catch {
        this.resetEvaluationFlag("student");
        this.studentEvaluationStateResolved = false;
      }
      return;
    }

    this.resetEvaluationFlag("student");
    this.studentEvaluationStateResolved = false;
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  public redirectPreviewAddress(url?: string | null): string | undefined {
    let new_ulr = '';
    if (this.youNeedMenu) {
      new_ulr = "/#/preview-learning-object/"+this.object.slug
      return new_ulr;
    }
    return url;
  }

  private syncPreviewState() {
    this.youNeedMenu = shouldDisplayLearningObjectMenu(this.object);
  }

  private async refreshObjectContext() {
    await Promise.all([
      this.getNumberOfDownloads(),
      this.loadViews(),
    ]);
    this.syncPreviewState();
  }

  private async reloadEvaluationState() {
    this.resetEvaluationFlag("expert");
    this.resetEvaluationFlag("student");
    await Promise.all([
      this.loadDataExpertEvaluation(),
      this.loadDataStudentEvaluation(),
    ]);
    this.cdr.detectChanges();
  }

  private setEvaluationFlag(type: "expert" | "student", hasResults: boolean) {
    const value = hasResults ? 1 : 0;

    if (type === "expert") {
      this.flagQuestionsEx = hasResults;
      this.flagQuestionsExNumber = value;
      return;
    }

    this.flagQuestionsEst = hasResults;
    this.flagQuestionsEstNumber = value;
  }

  private resetEvaluationFlag(type: "expert" | "student") {
    if (type === "expert") {
      this.flagQuestionsEx = false;
      this.flagQuestionsExNumber = -1;
      return;
    }

    this.flagQuestionsEst = false;
    this.flagQuestionsEstNumber = -1;
  }

  private async updateLikeInteraction() {
    if (!this.interaction?.id) {
      this.liked = !this.liked;
      return;
    }

    try {
      const res = await firstValueFrom(
        this.learningObject.interactionLike({
          ...this.interaction,
          id: this.interaction.id,
        })
      );
      this.interaction = res;
    } catch {
      this.liked = !this.liked;
    }
  }

  private resolveDownloadUrl(url: string | LearningObjectFile | null | undefined): string | null {
    if (typeof url === "string") {
      return url;
    }

    if (url?.file) {
      return url.file;
    }

    if (url?.url) {
      return url.url;
    }

    return null;
  }
}





