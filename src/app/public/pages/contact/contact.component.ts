import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { MessageService } from "primeng/api";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.css"],
})
export class ContactComponent implements OnInit {
  public angForm: FormGroup;
  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private languageService: LanguageService
    ) 
    {
    this.createForm();
      
  }

  ngOnInit(): void {
  
  }

  createForm() {
    this.angForm = this.fb.group({
      name: [null, Validators.required],
      email: [null, Validators.required],
      message: [null, Validators.required],
    });
  }
  validateUser() {
    if (this.angForm.valid) {
      this.showSuccess();
      this.angForm.reset();
    } else {
      this.markTouchForm();
    }
  }
  showSuccess() {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: "Datos enviados correctamente",
    });
  }
  markTouchForm() {
    (<any>Object).values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
  get name() {
    return this.angForm.get("name");
  }
  get email() {
    return this.angForm.get("email");
  }
  get message() {
    return this.angForm.get("message");
  }
}
