import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { getHttpErrorMessage } from "src/app/core/utils/http-error.utils";
import { normalizeMultilineMessage } from "src/app/core/utils/multiline-message.utils";
import {
  LEARNING_OBJECT_MESSAGE_MAX_LENGTH,
  LearningObjectMessageTemplate,
  composeLearningObjectMessage,
} from "../../shared/learning-object-message-templates";

/**
 * Dialogo para escribir el mensaje al docente (hallazgos o eliminacion).
 *
 * Arma el texto desde la plantilla segun la situacion y las observaciones
 * marcadas, y lo deja editable. Si el admin ya edito el texto, cambiar las
 * casillas no lo pisa: aparece "Regenerar mensaje". El envio lo hace el
 * padre con `submit`; si falla, el error se muestra aqui sin cerrar.
 */
@Component({
  selector: "app-learning-object-message-dialog",
  templateUrl: "./learning-object-message-dialog.component.html",
  styleUrls: ["./learning-object-message-dialog.component.css"],
  standalone: false,
})
export class LearningObjectMessageDialogComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input({ required: true }) template!: LearningObjectMessageTemplate;
  /** Situacion marcada al abrir; si no existe en la plantilla, la primera. */
  @Input() defaultOutcomeId = "";
  @Input() header = "";
  @Input() description = "";
  @Input() submitLabel = "Enviar";
  @Input() submitIcon = "pi pi-send";
  @Input() submitSeverity: "primary" | "danger" = "primary";

  /** Envia el mensaje ya normalizado; debe rechazar si el backend falla. */
  @Input({ required: true }) submit!: (message: string) => Promise<void>;
  @Input() formatError: (error: unknown) => string = (error) => getHttpErrorMessage(error);

  /** Se emite cuando `submit` termino bien y el dialogo se cerro. */
  @Output() sent = new EventEmitter<void>();

  readonly maxLength = LEARNING_OBJECT_MESSAGE_MAX_LENGTH;

  public outcomeId = "";
  public findingIds: string[] = [];
  public message = "";
  public submitting = false;
  public errorMessage = "";
  private generatedMessage = "";

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["visible"] && this.visible) {
      this.reset();
    }
  }

  /** El texto ya no es el que armo la plantilla. */
  public get edited(): boolean {
    return this.message !== this.generatedMessage;
  }

  public get tooLong(): boolean {
    return this.message.length > this.maxLength;
  }

  public get canSubmit(): boolean {
    return !this.submitting && !!this.message.trim() && !this.tooLong;
  }

  public get showOutcomes(): boolean {
    return this.template.outcomes.length > 1;
  }

  public onOutcomeChange(outcomeId: string): void {
    this.outcomeId = outcomeId;
    this.onSelectionChange();
  }

  public onFindingsChange(findingIds: string[]): void {
    this.findingIds = findingIds;
    this.onSelectionChange();
  }

  public regenerate(): void {
    this.generatedMessage = composeLearningObjectMessage(
      this.template,
      this.outcomeId,
      this.findingIds
    );
    this.message = this.generatedMessage;
  }

  public close(): void {
    if (this.submitting) {
      return;
    }
    this.setVisible(false);
  }

  public async send(): Promise<void> {
    if (!this.canSubmit) {
      return;
    }

    this.submitting = true;
    this.errorMessage = "";
    try {
      await this.submit(normalizeMultilineMessage(this.message));
      this.setVisible(false);
      this.sent.emit();
    } catch (error: unknown) {
      this.errorMessage = this.formatError(error);
    } finally {
      this.submitting = false;
      this.cdr.markForCheck();
    }
  }

  private onSelectionChange(): void {
    if (!this.edited) {
      this.regenerate();
    }
  }

  private reset(): void {
    const outcomes = this.template.outcomes;
    this.outcomeId =
      outcomes.find((outcome) => outcome.id === this.defaultOutcomeId)?.id ?? outcomes[0]?.id ?? "";
    this.findingIds = [];
    this.errorMessage = "";
    this.submitting = false;
    this.regenerate();
  }

  private setVisible(visible: boolean): void {
    this.visible = visible;
    this.visibleChange.emit(visible);
  }
}
