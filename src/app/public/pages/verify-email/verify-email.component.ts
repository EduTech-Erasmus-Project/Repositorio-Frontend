import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { firstValueFrom } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { UserService } from "src/app/services/user.service";
import { ApiMessageResponse } from "src/app/core/interfaces/api-contracts";

/**
 * Orquesta el flujo publico de verificacion de cuenta por token.
 *
 * Responsabilidades:
 * - Consumir el token y el correo codificado desde la ruta.
 * - Resolver el estado visual de verificacion, expiracion o reenvio.
 * - Guiar al usuario a una ruta segura cuando el token es invalido.
 *
 * Notas:
 * - `detectChanges()` se conserva para reflejar `isLoading` e `isResending`
 *   inmediatamente despues de operaciones async en Angular 21.
 */
@Component({
  selector: "app-verify-email",
  templateUrl: "./verify-email.component.html",
  styleUrls: ["./verify-email.component.scss"],
  standalone: false,
})
export class VerifyEmailComponent implements OnInit {
  private readonly encodedEmail: string;
  private readonly token: string;
  private decodedEmail: string | null = null;

  public state_request = false;
  public state_success = false;
  public state_success_token = false;
  public isLoading = true;
  public isResending = false;

  constructor(
    private activeRoute: ActivatedRoute,
    public _router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    this.encodedEmail = this.activeRoute.snapshot.params.email;
    this.token = this.activeRoute.snapshot.params.token;
    void this.addBreadcrumb();
  }

  ngOnInit(): void {
    void this.set_email_token();
  }

  /**
   * Valida el token recibido en la URL y actualiza el estado visual de la pagina.
   */
  public async set_email_token(): Promise<void> {
    const decodedEmail = this.decodeRouteEmail();

    if (!decodedEmail) {
      await this._router.navigate(["/notfound"]);
      return;
    }

    this.isLoading = true;
    this.resetStates();
    this.cdr.detectChanges();

    try {
      await firstValueFrom(
        this.userService.sent_email_token_verify(this.token, decodedEmail)
      );
      this.state_success = true;
    } catch (err: unknown) {
      const error = err as HttpErrorResponse & {
        error?: ApiMessageResponse & { error?: string };
      };
      const message = error?.error?.error;

      if (message === "Token invalido") {
        this.showError("verifyEmail.messages.cannotVerify");
        await this._router.navigate(["/notfound"]);
        return;
      }

      if (message === "Activacion expirada") {
        this.state_request = true;
        this.showError("verifyEmail.messages.sessionExpired");
      } else {
        await this._router.navigate(["/"]);
        return;
      }
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Solicita un nuevo enlace de activacion para el correo asociado al token actual.
   */
  public async set_token_user(): Promise<void> {
    if (!this.decodedEmail) {
      await this._router.navigate(["/notfound"]);
      return;
    }

    this.isResending = true;
    this.cdr.detectChanges();

    try {
      const responseEmail = await firstValueFrom(
        this.userService.set_email_verify_new_token(this.decodedEmail)
      );

      if (responseEmail?.status === 200) {
        this.resetStates();
        this.state_success_token = true;
        this.showSuccess("verifyEmail.messages.newLinkSent");
        return;
      }

      this.resetStates();
      await this._router.navigate(["/"]);
    } catch {
      this.resetStates();
      await this._router.navigate(["/"]);
    } finally {
      this.isResending = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Publica el breadcrumb traducido del flujo de verificacion.
   */
  private async addBreadcrumb(): Promise<void> {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: await firstValueFrom(this.languageService.translate.get("menu.sendLink")),
        routerLink: ["/login"],
      },
    ]);
  }

  /**
   * Reestablece los estados mutuamente excluyentes de la vista.
   */
  private resetStates(): void {
    this.state_request = false;
    this.state_success = false;
    this.state_success_token = false;
  }

  /**
   * Decodifica el correo enviado en la ruta y reutiliza el resultado
   * durante la validacion inicial y el reenvio del enlace.
   */
  private decodeRouteEmail(): string | null {
    if (this.decodedEmail) {
      return this.decodedEmail;
    }

    try {
      this.decodedEmail = atob(this.encodedEmail);
      return this.decodedEmail;
    } catch {
      return null;
    }
  }

  private showError(messageKey: string): void {
    this.messageService.add({
      severity: "error",
      summary: this.languageService.translate.instant("message.titleError"),
      detail: this.languageService.translate.instant(messageKey),
    });
  }

  private showSuccess(messageKey: string): void {
    this.messageService.add({
      severity: "success",
      summary: this.languageService.translate.instant("message.titleSuccess"),
      detail: this.languageService.translate.instant(messageKey),
    });
  }
}
