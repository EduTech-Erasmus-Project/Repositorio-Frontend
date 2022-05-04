import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";

@Component({
  selector: "app-view-questions",
  templateUrl: "./view-questions.component.html",
  styleUrls: ["./view-questions.component.css"],
})
export class ViewQuestionsComponent implements OnInit {
  public groupedQuestions: any[];
  public selectedQuesions: any[];

  public subscribes: Subscription[] = [];

  public angForm: FormGroup;

  constructor(
    private searchService: SearchService,
    private loginService: LoginService,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  createForm() {
    this.angForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    if (
      this.loginService.validateRole("student")
    ) {
      let groupedQes = await this.searchService
        .geQuestionsStudent()
        .subscribe((res) => {
          this.groupedQuestions = res.map((item: any) => {
            return {
              value: item.id,
              label: item.principle,
              items: item.guidelines.map((item: any) => {
                return { value: item.id, label: item.guideline };
              }),
            };
          });
          this.groupedQuestions = this.groupedQuestions;
          this.groupedQuestions.forEach((element) => {
            element.items.forEach((item) => {
              this.angForm.addControl(
                item.value,
                new FormControl(null, Validators.required)
              );
            });
          });
        });

      this.subscribes.push(groupedQes);
    }
  }

  getNumber(event) {
    //console.log('Numb', event)
    return this.angForm.get(String(event)).value;
  }
}
