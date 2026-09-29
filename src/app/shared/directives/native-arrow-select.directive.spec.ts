import { Component, forwardRef, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { By } from "@angular/platform-browser";
import { Select } from "primeng/select";
import { NativeArrowSelectDirective } from "./native-arrow-select.directive";

@Component({
  selector: "p-select",
  template: "",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectStubComponent),
      multi: true,
    },
    {
      provide: Select,
      useExisting: forwardRef(() => SelectStubComponent),
    },
  ],
  standalone: false,
})
class SelectStubComponent implements ControlValueAccessor {
  @Input() options: unknown[] = [];

  overlayVisible = false;
  disabled = false;
  readonly = false;

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(): void {}
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

@Component({
  template: `
    <p-select
      [formControl]="control"
      [appNativeArrowSelect]="options"
      nativeArrowValueField="id"
      nativeArrowDisabledField="disabled"
    ></p-select>
  `,
  standalone: false,
})
class HostComponent {
  control = new FormControl<number | null>(2);
  options = [
    { id: 1, label: "Uno" },
    { id: 2, label: "Dos", disabled: true },
    { id: 3, label: "Tres" },
  ];
}

describe("NativeArrowSelectDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;
  let selectInstance: SelectStubComponent;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NativeArrowSelectDirective, SelectStubComponent, HostComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const selectDebug = fixture.debugElement.query(By.directive(SelectStubComponent));
    selectInstance = selectDebug.componentInstance;
    hostElement = selectDebug.nativeElement as HTMLElement;
  });

  function dispatchArrow(key: "ArrowDown" | "ArrowUp"): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    hostElement.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  it("debe avanzar al siguiente valor habilitado con ArrowDown cuando el overlay esta cerrado", () => {
    component.control.setValue(1);

    dispatchArrow("ArrowDown");

    expect(component.control.value).toBe(3);
    expect(component.control.touched).toBeTrue();
    expect(component.control.dirty).toBeTrue();
  });

  it("debe volver al primer valor habilitado cuando el valor actual no existe en la lista normalizada", () => {
    component.control.setValue(999);

    dispatchArrow("ArrowDown");

    expect(component.control.value).toBe(1);
  });

  it("no debe cambiar el valor cuando el overlay del select esta visible", () => {
    component.control.setValue(1);
    selectInstance.overlayVisible = true;

    dispatchArrow("ArrowDown");

    expect(component.control.value).toBe(1);
  });
});
