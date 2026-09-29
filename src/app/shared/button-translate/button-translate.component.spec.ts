import { Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { ButtonTranslateComponent } from "./button-translate.component";
import { LanguageService } from "src/app/services/language.service";
import { StorageService } from "src/app/services/storage.service";

@Pipe({
    name: "translate",
    standalone: false
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("ButtonTranslateComponent", () => {
  let fixture: ComponentFixture<ButtonTranslateComponent>;
  let component: ButtonTranslateComponent;
  let languageServiceSpy: jasmine.SpyObj<LanguageService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    languageServiceSpy = jasmine.createSpyObj("LanguageService", ["setTranslate"]);
    storageServiceSpy = jasmine.createSpyObj("StorageService", [
      "getLocalItem",
      "saveLocalItem",
    ]);
    storageServiceSpy.getLocalItem.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ButtonTranslateComponent, TranslatePipeMock],
      providers: [
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    }).compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(ButtonTranslateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe iniciar en espanol cuando no existe cookie", () => {
    createComponent();

    expect(component.selectedLanguage).toBe("es");
  });

  it("debe iniciar con el lenguaje guardado en cookie", () => {
    storageServiceSpy.getLocalItem.and.returnValue("en");

    createComponent();

    expect(component.selectedLanguage).toBe("en");
  });

  it("debe cambiar el idioma, guardar cookie y recargar al seleccionar otro valor", () => {
    createComponent();
    const reloadSpy = spyOn(component, "reloadPage");

    component.selectLanguage("en");

    expect(languageServiceSpy.setTranslate).toHaveBeenCalledWith("en");
    expect(storageServiceSpy.saveLocalItem).toHaveBeenCalledWith(
      "lenguaje",
      "en"
    );
    expect(reloadSpy).toHaveBeenCalled();
  });

  it("debe enlazar el select del template con el idioma seleccionado", async () => {
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();
    spyOn(component, "reloadPage");

    const select: HTMLSelectElement = fixture.nativeElement.querySelector("select");
    expect(component.selectedLanguage).toBe("es");

    select.value = "en";
    select.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(storageServiceSpy.saveLocalItem).toHaveBeenCalledWith(
      "lenguaje",
      "en"
    );
    expect(languageServiceSpy.setTranslate).toHaveBeenCalledWith("en");
  });
});
