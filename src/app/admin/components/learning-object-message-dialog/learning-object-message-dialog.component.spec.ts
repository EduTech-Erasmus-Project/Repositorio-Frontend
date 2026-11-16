import { NO_ERRORS_SCHEMA, SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  DELETE_MESSAGE_TEMPLATE,
  FINDINGS_MESSAGE_TEMPLATE,
} from "../../shared/learning-object-message-templates";
import { LearningObjectMessageDialogComponent } from "./learning-object-message-dialog.component";

describe("LearningObjectMessageDialogComponent", () => {
  let fixture: ComponentFixture<LearningObjectMessageDialogComponent>;
  let component: LearningObjectMessageDialogComponent;
  let submitSpy: jasmine.Spy<(message: string) => Promise<void>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LearningObjectMessageDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LearningObjectMessageDialogComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(LearningObjectMessageDialogComponent);
    component = fixture.componentInstance;
    submitSpy = jasmine.createSpy("submit").and.resolveTo();
    component.template = FINDINGS_MESSAGE_TEMPLATE;
    component.submit = submitSpy;
  });

  function open(): void {
    component.visible = true;
    component.ngOnChanges({ visible: new SimpleChange(false, true, false) });
  }

  it("debe precargar el mensaje de la primera situacion al abrir", () => {
    open();

    expect(component.outcomeId).toBe("approved");
    expect(component.message.startsWith("¡Felicidades!")).toBeTrue();
    expect(component.edited).toBeFalse();
  });

  it("debe abrir con la situacion por defecto si existe en la plantilla", () => {
    component.defaultOutcomeId = "not-approved";
    open();
    expect(component.outcomeId).toBe("not-approved");
    expect(component.message).toContain("no cumple con los parámetros");

    component.defaultOutcomeId = "inexistente";
    open();
    expect(component.outcomeId).toBe("approved");
  });

  it("debe rehacer el mensaje al cambiar casillas si no fue editado", () => {
    open();
    component.onFindingsChange(["multimedia"]);
    component.onOutcomeChange("not-approved");

    expect(component.message).toContain("Incluir recursos multimedia");
    expect(component.message).toContain("Para que pueda ser aprobado");
  });

  it("no debe pisar el texto editado y debe permitir regenerarlo", () => {
    open();
    component.message += "\nNota del admin.";
    component.onFindingsChange(["multimedia"]);

    expect(component.message).toContain("Nota del admin.");
    expect(component.edited).toBeTrue();

    component.regenerate();
    expect(component.message).toContain("Incluir recursos multimedia");
    expect(component.edited).toBeFalse();
  });

  it("debe limpiar la seleccion al volver a abrir", () => {
    open();
    component.onFindingsChange(["multimedia"]);
    component.message = "otro";
    open();

    expect(component.findingIds).toEqual([]);
    expect(component.message).not.toContain("multimedia");
  });

  it("debe ocultar los radios cuando hay una sola situacion", () => {
    component.template = DELETE_MESSAGE_TEMPLATE;
    expect(component.showOutcomes).toBeFalse();
    component.template = FINDINGS_MESSAGE_TEMPLATE;
    expect(component.showOutcomes).toBeTrue();
  });

  it("no debe permitir enviar un mensaje vacio o demasiado largo", () => {
    open();
    component.message = "   ";
    expect(component.canSubmit).toBeFalse();

    component.message = "x".repeat(component.maxLength + 1);
    expect(component.tooLong).toBeTrue();
    expect(component.canSubmit).toBeFalse();
  });

  it("debe enviar el mensaje normalizado, cerrar y avisar", async () => {
    const visibleChanges: boolean[] = [];
    component.visibleChange.subscribe((value) => visibleChanges.push(value));
    const sentSpy = jasmine.createSpy("sent");
    component.sent.subscribe(sentSpy);
    open();
    component.message = "Linea 1\r\nLinea 2";

    await component.send();

    expect(submitSpy).toHaveBeenCalledOnceWith("Linea 1\nLinea 2");
    expect(visibleChanges).toEqual([false]);
    expect(sentSpy).toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });

  it("debe mostrar el error y seguir abierto si el envio falla", async () => {
    submitSpy.and.rejectWith({ error: { message: "Sin correo del docente" } });
    const sentSpy = jasmine.createSpy("sent");
    component.sent.subscribe(sentSpy);
    open();

    await component.send();

    expect(component.errorMessage).toBe("Sin correo del docente");
    expect(component.visible).toBeTrue();
    expect(sentSpy).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });
});
