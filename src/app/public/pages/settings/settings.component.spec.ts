import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LoginService } from "../../../services/login.service";
import { SettingsComponent } from "./settings.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("SettingsComponent", () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;

  async function createComponent(userOverrides: Record<string, unknown> = {}) {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent, TranslatePipeMock],
      providers: [
        {
          provide: LoginService,
          useValue: {
            user: {
              first_name: "Ana",
              last_name: "Perez",
              image: "https://example.com/avatar.png",
              ...userOverrides,
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("expone el nombre visible del usuario autenticado", async () => {
    await createComponent();

    expect(component.displayName).toBe("Ana Perez");

    const nameElement = fixture.nativeElement.querySelector(".settings-page__name");
    expect(nameElement.textContent.trim()).toBe("Ana Perez");
  });

  it("usa una imagen fallback cuando la sesion no trae avatar", async () => {
    await createComponent({ image: "" });

    expect(component.profileImage).toBe("assets/img/noimage.png");

    const avatar = fixture.nativeElement.querySelector(".settings-page__avatar");
    expect(avatar.getAttribute("src")).toContain("assets/img/noimage.png");
  });

  it("usa un nombre generico cuando la sesion no trae nombres", async () => {
    await createComponent({ first_name: "", last_name: "" });

    expect(component.displayName).toBe("Usuario");
  });
});
