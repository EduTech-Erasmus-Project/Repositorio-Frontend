import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { Router } from "@angular/router";
import { AddressService } from "../../services/address.service";
import Swal from "sweetalert2";
import { SettingsService } from "../../services/settings.service";

@Component({
  selector: "app-email-server-form",
  templateUrl: "./email-server-form.component.html",
  styleUrls: ["./email-server-form.component.scss"],
})
export class EmailServerFormComponent implements OnInit {
  public loader: boolean = false;
  public form: FormGroup;
  private _id?: number;

  constructor(
    private _fb: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Editar",
        routerLink: ["/admin/config/server"],
      },
    ]);
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      host: [null, Validators.required],
      username: [null, Validators.required],
      password: [null],
      emailtest: [null],
      port: [null, Validators.required],
      tls: [true, Validators.required],
      email_from: [true, Validators.required],
    });

    this.loadData();
  }

  public async loadData() {
    try {
      let resp = await this.settingsService.getOrCreateServer().toPromise();
      this.form.patchValue(resp);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }

  public getErrorRequired(field: string) {
    return (
      this.form.get(field)?.hasError("required") &&
      this.form.get(field)?.touched
    );
  }

  public async onSave() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    try {
      this.loader = true;
      let data = this.form.value;
      await this.update(data);
      Swal.fire({
        icon: "success",
        title: "Exito!",
        text: "Se ha actualizado el servidor de correo",
      });
      this.loader = false;
    } catch (error) {
      this.loader = false;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }

  private async update(data) {
    return await this.settingsService.updateServer(data).toPromise();
  }

  public async onTestEmail() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (!this.form.value.emailtest) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Debe ingresar un correo para enviar un mensaje de prueba.",
      });
      return;
    }
    try {
      this.loader = true;
      Swal.showLoading();
      let resp = await this.settingsService
        .testServer(this.form.value)
        .toPromise();
      Swal.hideLoading();
      Swal.fire({
        icon: "success",
        title: "Exito!",
        text: "Se ha enviado un correo de prueba",
      });
      this.loader = false;
    } catch (error) {
      this.loader = false;
      Swal.hideLoading();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }
}
