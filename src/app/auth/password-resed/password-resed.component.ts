import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { SearchService } from 'src/app/services/search.service';
import Swal from "sweetalert2";

@Component({
  selector: 'app-password-resed',
  templateUrl: './password-resed.component.html',
  styleUrls: ['./password-resed.component.scss']
})
export class PasswordResedComponent implements OnInit {

  public angForm: FormGroup;

  public flagConfirm: boolean = false;
  public newPassword: string;
  public againPassword: string;
  public show2: boolean = false;
  public subscribes: Subscription[] = [];
  public Credencial: { uidb64: string, token: string };
  public verifyToken: any[];
  public answersToken: any;
  public tokenVerify: boolean = false;

  constructor(
    private fb: FormBuilder,
    private rutaActiva: ActivatedRoute,
    private searchService: SearchService,
    private messageService: MessageService,
    private loginService: LoginService,
    private router: Router,
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.Credencial = {
      uidb64: this.rutaActiva.snapshot.params.uidb64,
      token: this.rutaActiva.snapshot.params.token
    };
    this.loadData();
  }
  async loadData() {
    let resToken = await this.searchService.getTokenRestPassword(this.Credencial.uidb64, this.Credencial.token).subscribe(res => {

      if (res.success == true) {
        this.verifyToken = res;
        //console.log("Res desde aqui", res);
        this.tokenVerify = true;
      }

    }, (err) => {

      if (err.error.error == "Token is no valid, please request a new one") {
        this.showError('Enlace de verififcacion incorrecto');
        this.tokenVerify = false;
      }

    });

    this.subscribes.push(resToken);
  }
  createForm() {
    this.angForm = this.fb.group({
      passwordNew: [
        this.newPassword,
        [
          Validators.required,
          Validators.pattern(
            "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}"
          ),
        ],
      ],
      passwordAgain: [
        this.againPassword,
        [
          Validators.required
        ],
      ],

    }
    );
  }

  showError(message) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  showSuccess(message) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showInfo(message){
    this.messageService.add({severity:'info', summary: 'Info', detail: message });
  }

  async sentEmail() {

    if (this.angForm.valid) {

      Swal.fire({
        allowOutsideClick: false,
        icon: "info",
        text: "Actualizando la contraseña",
      });
      Swal.showLoading();

      this.newPassword = this.angForm.get('passwordNew').value;
      this.againPassword = this.angForm.get('passwordAgain').value;
      if (this.tokenVerify == true) {
        if (this.newPassword == this.againPassword) {
          this.answersToken={
            "password": this.newPassword,
            "token": this.Credencial.token,
            "uidb64":this.Credencial.uidb64
          }
          let sendResPass = await this.loginService.resetPassToken(this.answersToken).subscribe(
            res => {
                this.showSuccess("Contraseña cambiada con exito");
                this.angForm.reset();
                Swal.close();
                this.router.navigateByUrl("/reset/confirm");
            },(err)=>{
             // console.log("Err",err);
              this.showError("No se puedo cambiar la contraseña")
              Swal.close();
            });

            this.subscribes.push(sendResPass);
        } else {
          this.showError('Las contraseñas no coinciden');
          Swal.close();
        }
      } else {
        this.showError('El token no es válido, solicite uno nuevo');
        this.angForm.reset();
        Swal.close();
      }

    }
  }

  validatorPassword() {
    if (this.angForm.get('passwordNew').value == this.angForm.get('passwordAgain').value) {
      // console.log('Si son iguales')
      this.flagConfirm = true;
    }
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  get passwordNew() {
    return this.angForm.get('passwordNew')
  }

  get passwordAgain() {
    return this.angForm.get('passwordAgain')
  }


}
