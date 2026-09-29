import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, FormRecord } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { StudentPrincipleResponse } from "src/app/core/interfaces/api-contracts";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";

interface ViewQuestionItem {
  value: number;
  label: string;
}

interface ViewQuestionGroup {
  value: number;
  label: string;
  items: ViewQuestionItem[];
}

type ViewQuestionsForm = FormRecord<FormControl<number | null>>;

/**
 * Muestra en modo lectura la estructura de principios y pautas usada por la evaluacion estudiantil.
 *
 * Responsabilidades:
 * - Consultar el catalogo de preguntas disponible para estudiantes.
 * - Agrupar pautas dentro de su principio para presentacion jerarquica.
 * - Exponer un cierre simple del dialog contenedor.
 */
@Component({
    selector: "app-view-questions",
    templateUrl: "./view-questions.component.html",
    styleUrls: ["./view-questions.component.css"],
    standalone: false
})
export class ViewQuestionsComponent implements OnInit {
  @Output() closeRequested = new EventEmitter<void>();

  public groupedQuestions: ViewQuestionGroup[] = [];
  public angForm: ViewQuestionsForm = new FormRecord<FormControl<number | null>>({});

  constructor(
    private searchService: SearchService,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData() {
    if (!this.loginService.validateRole("student")) {
      return;
    }

    const res = await firstValueFrom(this.searchService.geQuestionsStudent());
    this.groupedQuestions = res.map((item) => this.mapQuestionGroup(item));
    this.buildForm(this.groupedQuestions);
    this.cdr.detectChanges();
  }

  getNumber(event: number) {
    return this.angForm.get(String(event))?.value;
  }

  closeView() {
    this.closeRequested.emit();
  }

  trackByGroup(index: number, item: ViewQuestionGroup) {
    return item.value;
  }

  trackByQuestion(index: number, item: ViewQuestionItem) {
    return item.value;
  }

  private buildForm(groups: ViewQuestionGroup[]) {
    this.angForm = new FormRecord<FormControl<number | null>>({});

    groups.forEach((group) => {
      group.items.forEach((item) => {
        this.angForm.addControl(String(item.value), new FormControl<number | null>(null));
      });
    });
  }

  private mapQuestionGroup(item: StudentPrincipleResponse): ViewQuestionGroup {
    return {
      value: item.id,
      label: item.principle,
      items: (item.guidelines || []).map((guideline) => ({
        value: guideline.id,
        label: guideline.guideline,
      })),
    };
  }
}
