import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { of } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { EmailMessageComponent } from "./email-message.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("EmailMessageComponent", () => {
  let fixture: ComponentFixture<EmailMessageComponent>;
  let component: EmailMessageComponent;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;

  beforeEach(async () => {
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      declarations: [EmailMessageComponent, TranslatePipeMock],
      providers: [
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Enviar enlace")),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it("publica el breadcrumb traducido al iniciar", async () => {
    fixture = TestBed.createComponent(EmailMessageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalledWith([
      { label: "ROA" },
      { label: "Enviar enlace", routerLink: ["/emailMessage"] },
    ]);
  });
});
