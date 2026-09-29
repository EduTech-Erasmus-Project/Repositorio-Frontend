import { CommonModule } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ButtonModule } from "primeng/button";
import { of } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { ResetComponent } from "./reset.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("ResetComponent", () => {
  let component: ResetComponent;
  let fixture: ComponentFixture<ResetComponent>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;

  beforeEach(async () => {
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        ButtonModule,
      ],
      declarations: [ResetComponent, TranslatePipeMock],
      providers: [
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Confirmar cambio")),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetComponent);
    component = fixture.componentInstance;
  });

  it("publica el breadcrumb de confirmacion al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalledWith([
      { label: "ROA" },
      { label: "Confirmar cambio", routerLink: ["/login"] },
    ]);
  });
});
