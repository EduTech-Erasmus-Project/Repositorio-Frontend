import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Optional,
  Self,
} from "@angular/core";
import { NgControl } from "@angular/forms";
import { Select } from "primeng/select";

type NativeSelectOption = Record<string, unknown> | string | number | boolean | null;

@Directive({
  selector: "p-select[appNativeArrowSelect]",
  standalone: false,
})
/**
 * Agrega navegacion con flechas a `p-select` cuando el overlay aun no esta abierto.
 *
 * El objetivo es conservar un patron similar al `<select>` nativo para flujos con
 * lector de pantalla o navegacion solo por teclado.
 */
export class NativeArrowSelectDirective implements AfterViewInit, OnDestroy {
  @Input("appNativeArrowSelect") options: NativeSelectOption[] | null = [];
  @Input() nativeArrowValueField?: string;
  @Input() nativeArrowDisabledField?: string;

  private keydownListener?: EventListener;

  constructor(
    private host: ElementRef<HTMLElement>,
    @Self() private ngControl: NgControl,
    @Self() @Optional() private select: Select
  ) {}

  /**
   * Intercepta flechas arriba/abajo antes de que PrimeNG abra el overlay para
   * avanzar el valor directamente sobre el control reactivo asociado.
   */
  ngAfterViewInit(): void {
    this.keydownListener = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;

      if (
        !this.select ||
        this.select.overlayVisible ||
        this.select.disabled ||
        this.select.readonly ||
        keyboardEvent.altKey ||
        keyboardEvent.ctrlKey ||
        keyboardEvent.metaKey ||
        (keyboardEvent.key !== "ArrowDown" && keyboardEvent.key !== "ArrowUp")
      ) {
        return;
      }

      const nextValue = this.getNextValue(
        keyboardEvent.key === "ArrowDown" ? 1 : -1
      );

      if (nextValue === undefined) {
        return;
      }

      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();

      if (typeof keyboardEvent.stopImmediatePropagation === "function") {
        keyboardEvent.stopImmediatePropagation();
      }

      this.ngControl.control?.markAsTouched();
      this.ngControl.control?.markAsDirty();
      this.ngControl.control?.setValue(nextValue);
    };

    this.host.nativeElement.addEventListener(
      "keydown",
      this.keydownListener,
      true
    );
  }

  /**
   * Limpia el listener manual agregado al host del `p-select`.
   */
  ngOnDestroy(): void {
    if (this.keydownListener) {
      this.host.nativeElement.removeEventListener(
        "keydown",
        this.keydownListener,
        true
      );
    }
  }

  private getNextValue(direction: 1 | -1): unknown {
    const normalizedOptions = (this.options ?? []).filter(
      (option) => !this.isDisabled(option)
    );

    if (!normalizedOptions.length) {
      return undefined;
    }

    const currentValue = this.ngControl.control?.value;
    const currentIndex = normalizedOptions.findIndex(
      (option) => this.getOptionValue(option) === currentValue
    );

    if (currentIndex === -1) {
      return this.getOptionValue(normalizedOptions[0]);
    }

    const nextIndex = Math.min(
      Math.max(currentIndex + direction, 0),
      normalizedOptions.length - 1
    );

    return this.getOptionValue(normalizedOptions[nextIndex]);
  }

  private getOptionValue(option: NativeSelectOption): unknown {
    if (!this.nativeArrowValueField || option == null || typeof option !== "object") {
      return option;
    }

    return option[this.nativeArrowValueField];
  }

  private isDisabled(option: NativeSelectOption): boolean {
    if (!this.nativeArrowDisabledField || option == null || typeof option !== "object") {
      return false;
    }

    return Boolean(option[this.nativeArrowDisabledField]);
  }
}
