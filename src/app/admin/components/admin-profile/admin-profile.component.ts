import { Component, OnInit } from '@angular/core';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LoginService } from 'src/app/services/login.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import { User } from '../../models/evaluation.models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css'],
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
  @media screen and (max-width: 960px) {
    :host ::ng-deep .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td:last-child {
        text-align: center;
    }

    :host ::ng-deep .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td:nth-child(6) {
        display: flex;
    }
}

`],
providers: [MessageService, ConfirmationService]
})
export class AdminProfileComponent implements OnInit {
  public formSubmit = false;
  public passwordUpdateForm = this.fb.group({
    password: [null, Validators.required],
    password2: [null, Validators.required],
    old_password: [null, Validators.required],
  }, {
    validators: this.passwordsVerified('password', 'password2')
  });
  user:any = {};
  userData:User=new User();
  administrator:any = {};
  isEmpty = false;
  changeDataDialog: boolean;
  changePasswordDialog: boolean;
  submitted: boolean;
  activeUpdate: boolean=false;
  isLoading:boolean = false;
  message:string=null;
  constructor(
    public loginService: LoginService,
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private messageService: MessageService,
    private fb: FormBuilder,
    
    ) { 
      this.breadcrumbService.setItems([
        { label: 'Mi perfil' },
      ]);
    }

  ngOnInit(): void {
    this.getUser(this.loginService.user.id);
    this.loginService.user.roles.includes("superuser")?this.activeUpdate=true:this.activeUpdate = false;
  }
  getUser(id: number){
    this.administratorService.getAdministratorUser(id).subscribe((user:any) =>{
      this.isLoading = true;
      this.user = user;
      if(user.administrator != null){
        this.isEmpty = true;
        this.administrator = user.administrator;
      }
    })
  }
  openChangePassword(){
    this.submitted = false;
    this.changePasswordDialog = true;
  }
  openChangeData(user: User){
    this.userData = user;
    this.submitted = false;
    this.changeDataDialog = true;
  }
  // hideDialogUpdate() {
  //   this.changePasswordDialog = false;
  //   this.submitted = false;
  // }
  hideDialogUpdateData() {
    this.changeDataDialog = false;
    this.submitted = false;
  }
  saveData(){
    this.administratorService.updateAdministratorDataUser(this.userData).subscribe((result:any) => {
      if(result['message']=="success"){
        this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Actualizado con éxito'});
        setTimeout(()=>{
          this.changeDataDialog = false;
          this.submitted = false;
        },400)
      }else{
        this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Ha ocurrido un error, por favor inténtelo de nuevo más tarde.'});
      }
    })
  }
  udpatePassword(){
    this.formSubmit = true;
    if (this.passwordUpdateForm.invalid) {
      return;
    }
    try {
      this.administratorService.changePassword(this.user.id,this.passwordUpdateForm.value).subscribe((data: any) =>{
        if(data.status==="Ok"){
          this.messageService.add({severity: 'info', summary: 'Confirmed', detail: 'Contraseña modificado correctamente.'});
          this.resetValue();
          setTimeout(() => {
            this.logOut();
          }, 700);
        }else if(data.details.old_password.old_password==="Old password is not correct"){
          this.message = "La contraseña anterior es incorrecto."
        }
      })
    } catch (error) {
      return
    }
  }
  campoNoValido(campo: string): boolean {
    if (this.passwordUpdateForm.get(campo).invalid && this.formSubmit) {
      return true;
    } else {
      return false;
    }
  }
  passwordsVerified(pass1Name: string, pass2Nmae: string) {
    return (formGroup: FormGroup) => {
      const pass1Control = formGroup.get(pass1Name);
      const pass2Control = formGroup.get(pass2Nmae);
      if (pass1Control.value === pass2Control.value) {
        pass2Control.setErrors(null);
      } else {
        pass2Control.setErrors({ noEsIgual: true });
      }

    }
  }
  logOut(){
    this.loginService.signOut();
  }
  resetValue(){
    this.changePasswordDialog = false;
    this.submitted = false;
    this.passwordUpdateForm.reset();
    this.formSubmit = false;
  }
}
