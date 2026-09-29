import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { Subject, forkJoin, takeUntil } from "rxjs";
import { LanguageService } from "../../../services/language.service";
import { SearchService } from "../../../services/search.service";
import { KnowledgeArea } from "src/app/core/interfaces/KnowledgeArea";

interface InterestAreaOption {
  label: string;
  value: {
    id?: number;
    name: string;
  };
}

@Component({
    selector: "app-search",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.scss"],
    standalone: false
})
export class SearchComponent implements OnInit, OnDestroy {
  public interestAreas: InterestAreaOption[] = [];
  public msjError: {
    severity: string;
    summary: string;
    detail: string;
  };
  public formSearch: UntypedFormGroup;
  public countStudents = 0;
  public countTeachers = 0;
  public countObjectLearning = 0;
  public showValidationError = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private languageService: LanguageService,
    private searchService: SearchService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formSearch = this.formBuilder.group({
      searchValue: [null, [Validators.required]],
      dropdownValue: [null],
    });

    this.buildErrorMessage();
    this.loadData();

    this.languageService.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((translate: LangChangeEvent) => {
        this.msjError = {
          severity: "error",
          summary: translate.translations.message.titleError,
          detail: translate.translations.home.msjMessage,
        };
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch() {
    this.showValidationError = false;

    if (this.formSearch.valid) {
      const { searchValue, dropdownValue } = this.formSearch.value;

      const extras: NavigationExtras = {
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

  private loadData() {
    forkJoin({
      areas: this.searchService.getInterestAreas(),
      users: this.searchService.countUsers(),
      objects: this.searchService.countObjectLearning(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ areas, users, objects }) => {
        this.interestAreas = (areas.values || []).map((item: KnowledgeArea) => ({
          label: item.name || "",
          value: { id: item.id, name: item.name || "" },
        }));

        this.countStudents = users.total_student;
        this.countTeachers = users.total_teacher;
        this.countObjectLearning = objects.total_oa_aproved;
        this.cdr.detectChanges();
      });
  }

  private buildErrorMessage() {
    const translate: TranslateService = this.languageService.translate;

    this.msjError = {
      severity: "error",
      summary: translate.instant("message.titleError"),
      detail: translate.instant("home.msjMessage"),
    };
  }

  private showMessageError() {
    this.showValidationError = true;
  }
}
