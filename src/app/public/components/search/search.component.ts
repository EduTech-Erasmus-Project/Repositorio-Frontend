import { Component, OnInit, OnDestroy } from "@angular/core";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { LanguageService } from "../../../services/language.service";
import { Subscription } from "rxjs";
import { MessageService } from "primeng/api";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { SearchService } from "../../../services/search.service";
import { NavigationExtras, Router } from "@angular/router";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, OnDestroy {
  public interestAreas: any[] = [];
  private subscribes: Subscription[] = [];
  public translate: TranslateService;
  public msjError;
  public formSearch: FormGroup;
  public countStudents: number;
  public countTeachers: number;
  public countObjectLearning: number;

  constructor(
    private languageService: LanguageService,
    private searchService: SearchService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.translate = this.languageService.translate;
    this.loadData();
    this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
      this.msjError = {
        severity: "error",
        summary: translate.translations.message.titleError,
        detail: translate.translations.home.msjMessage,
      };
    });

    this.formSearch = this.formBuilder.group({
      searchValue: [null, [Validators.required]],
      dropdownValue: [null],
    });
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((item) => {
      item.unsubscribe();
    });
  }

  async loadData() {
    let subscribeAreas = await this.searchService
      .getInterestAreas()
      .subscribe((res) => {
        //console.log(res);
        res.values.forEach((item) => {
          this.interestAreas.push({
            label: item.name,
            value: { id: item.id, name: item.name },
          });
        });
      });

    let subsUser = await this.searchService.countUsers().subscribe((res) => {
      //console.log("count users", res)
      this.countStudents = res.total_student;
      this.countTeachers = res.total_teacher;
    });

    let subsObjects = await this.searchService
      .countObjectLearning()
      .subscribe((res) => {
        //console.log("count objects", res)
        this.countObjectLearning = res.total_oa_aproved;
      });
    this.subscribes.push(subscribeAreas, subsUser, subsObjects);
  }

  loadTextTranslation() {
    let currentLng = this.translate.currentLang;
    if (currentLng === "es") {
      this.msjError = {
        severity: "error",
        summary: this.translate.translations.es.message.titleError,
        detail: this.translate.translations.es.home.msjMessage,
      };
    } else if (currentLng == "en") {
      this.msjError = {
        severity: "error",
        summary: this.translate.translations.en.message.titleError,
        detail: this.translate.translations.en.home.msjMessage,
      };
    }
  }

  showMessageError() {
    //optimize code
    this.messageService.add(this.msjError);
  }

  onSearch() {
    //optimize on translate implementation
    this.loadTextTranslation();

    this.messageService.clear();
    if (this.formSearch.valid) {
      let { searchValue, dropdownValue } = this.formSearch.value;

      //console.log(searchValue, dropdownValue);

      let extras: NavigationExtras = {
        queryParams: {
          general_title: searchValue,
          knowledge_area__name: dropdownValue?.name,
        },
      };

      this.router.navigate(["/search"], extras);
    } else {
      this.showMessageError();
    }
  }
}
