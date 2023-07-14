import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription, timer } from 'rxjs';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  private email: string;
  private token: string;
  public state_request: boolean = false;
  public state_success: boolean = false;
  public state_success_token: boolean = false;
  private _subcriptions: Subscription[] = [];
  constructor(
    private _activeRoute: ActivatedRoute,
    public _router: Router,
    private _userService: UserService,
    private messageService: MessageService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {

    //if(isNaN(+this._activeRoute.snapshot.params.token) && isNaN(+this._activeRoute.snapshot.params.email)){
    //this._router.navigate(['/']);
    //}

    this.email = this._activeRoute.snapshot.params.email;
    this.token = this._activeRoute.snapshot.params.token;
    this.add_breadcrumb();
  }

  ngOnInit(): void {
    this.set_email_token();
  }

  public async set_email_token() {
    let new_email = atob(this.email);
    let response_email = await this._userService.sent_email_token_verify(this.token, new_email).subscribe(
      response => {
        this.state_success = true;
      }, err => {
        if (err.error.error == 'Token invalido') {
          this._router.navigate(['/notfound'])
          this.showError('No se pudo verificar la cuenta');
        } else if (err.error.error == 'Activacion expirada') {
          this.state_request = true;
          this.showError('Sesión expirada');
        }
      }
    );
    this._subcriptions.push(response_email);
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await this.languageService.translate.get('menu.sendLink').toPromise(), routerLink: ["/login"] },
    ]);
  }

  private showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  private showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Correcto', detail: message });
  }
  public set_token_user() {
    let response_email = this._userService.set_email_verify_new_token(atob(this.email)).subscribe(
      (_email: any) => {
        if (_email.status == 200) {
          this.state_request = false;
          this.state_success_token = true;
          this.showSuccess('Se envio un nuevo enlace');
        } else {
          this._router.navigate(['/'])
        }
      }, error => {
        this._router.navigate(['/'])
      }
    );
    this._subcriptions.push(response_email);
  }
}
