import { Component, Input } from "@angular/core";
import { fakeAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { MenuItem } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { BreadcrumbComponent } from "./breadcrumb.component";

@Component({
  selector: "p-breadcrumb",
  template:
    '<nav class="p-breadcrumb"><a class="p-menuitem-link">Inicio</a><button type="button">Accion</button></nav>',
  standalone: false,
})
class BreadcrumbStubComponent {
  @Input() model: MenuItem[] = [];
  @Input() styleClass = "";
}

describe("BreadcrumbComponent", () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let component: BreadcrumbComponent;
  let items$: Subject<MenuItem[]>;
  let breadcrumbServiceStub: { items$: any };

  beforeEach(async () => {
    items$ = new Subject<MenuItem[]>();
    breadcrumbServiceStub = {
      items$: items$.asObservable(),
    };

    await TestBed.configureTestingModule({
      declarations: [BreadcrumbComponent, BreadcrumbStubComponent],
      providers: [{ provide: BreadcrumbService, useValue: breadcrumbServiceStub }],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe actualizar los items y retirar los enlaces del tab order cuando es informativo", fakeAsync(() => {
    spyOn(window, "requestAnimationFrame").and.callFake((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    createComponent();
    const detectChangesSpy = spyOn((component as any).cdr, "detectChanges").and.callThrough();

    items$.next([{ label: "Inicio" }, { label: "Admin" }]);
    fixture.detectChanges();

    const interactiveNodes = fixture.nativeElement.querySelectorAll(".p-breadcrumb a, .p-breadcrumb button");

    expect(component.items.length).toBe(2);
    expect(detectChangesSpy).toHaveBeenCalled();
    interactiveNodes.forEach((element: HTMLElement) => {
      expect(element.getAttribute("tabindex")).toBe("-1");
    });
  }));

  it("debe conservar los enlaces en el tab order cuando es interactivo", fakeAsync(() => {
    spyOn(window, "requestAnimationFrame").and.callFake((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    createComponent();
    component.interactive = true;

    items$.next([{ label: "Inicio" }, { label: "Admin" }]);
    fixture.detectChanges();

    const interactiveNodes = fixture.nativeElement.querySelectorAll(".p-breadcrumb a, .p-breadcrumb button");

    interactiveNodes.forEach((element: HTMLElement) => {
      expect(element.getAttribute("tabindex")).toBeNull();
    });
  }));
});
