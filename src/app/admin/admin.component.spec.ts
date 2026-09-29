import { Renderer2 } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { PrimeNG } from "primeng/config";
import { MenuService } from "../services/app.menu.service";
import { AppComponent } from "../app.component";
import { AdminComponent } from "./admin.component";

describe("AdminComponent", () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;
  let menuServiceSpy: jasmine.SpyObj<MenuService>;
  let rendererSpy: jasmine.SpyObj<Renderer2>;
  let primengConfigStub: any;
  let appStub: any;
  let savedMenuState: string | null;

  beforeEach(async () => {
    savedMenuState = null;
    spyOn(localStorage, "getItem").and.callFake((key: string) =>
      key === "menuActive" ? savedMenuState : null
    );
    spyOn(localStorage, "setItem");

    menuServiceSpy = jasmine.createSpyObj("MenuService", ["reset"]);
    rendererSpy = jasmine.createSpyObj("Renderer2", ["addClass", "removeClass"]);
    primengConfigStub = {
      ripple: {
        set: jasmine.createSpy("set"),
      },
    };
    appStub = {
      horizontalMenu: false,
      ripple: false,
    };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [AdminComponent],
      providers: [
        { provide: Renderer2, useValue: rendererSpy },
        { provide: MenuService, useValue: menuServiceSpy },
        { provide: PrimeNG, useValue: primengConfigStub },
        { provide: AppComponent, useValue: appStub },
      ],
    })
      .overrideComponent(AdminComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe iniciar con el menu estatico activo por defecto", () => {
    createComponent();

    expect(component.staticMenuActive).toBeTrue();
  });

  it("debe respetar el estado persistido del menu", () => {
    savedMenuState = "false";

    createComponent();

    expect(component.staticMenuActive).toBeFalse();
  });

  it("debe alternar el menu mobile al pulsar el boton de menu en pantallas pequenas", () => {
    createComponent();
    spyOn(component, "isMobile").and.returnValue(true);
    const event = jasmine.createSpyObj("event", ["preventDefault"]);

    component.onMenuButtonClick(event);

    expect(component.menuClick).toBeTrue();
    expect(component.topbarMenuActive).toBeFalse();
    expect(component.menuMobileActive).toBeTrue();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("debe reiniciar estados del layout al hacer click fuera y resetear menu horizontal", () => {
    createComponent();
    appStub.horizontalMenu = true;
    component.activeTopbarItem = { id: 1 };
    component.topbarMenuActive = true;
    component.rightPanelActive = true;
    component.megaMenuActive = true;
    component.megaMenuMobileActive = true;
    component.menuMobileActive = true;
    component.configActive = true;

    component.onLayoutClick();

    expect(component.activeTopbarItem).toBeNull();
    expect(component.topbarMenuActive).toBeFalse();
    expect(component.rightPanelActive).toBeFalse();
    expect(component.megaMenuActive).toBeFalse();
    expect(component.megaMenuMobileActive).toBeFalse();
    expect(component.menuMobileActive).toBeFalse();
    expect(component.configActive).toBeFalse();
    expect(menuServiceSpy.reset).toHaveBeenCalled();
  });

  it("debe alternar el item activo del topbar", () => {
    createComponent();
    const event = jasmine.createSpyObj("event", ["preventDefault"]);

    component.onTopbarItemClick(event, "perfil");
    expect(component.activeTopbarItem).toBe("perfil");

    component.onTopbarItemClick(event, "perfil");
    expect(component.activeTopbarItem).toBeNull();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("debe persistir el cambio de estado del menu lateral", () => {
    createComponent();
    const event = jasmine.createSpyObj("event", ["preventDefault"]);

    component.staticMenuActive = true;
    component.onToggleMenuClick(event);

    expect(component.staticMenuActive).toBeFalse();
    expect(localStorage.setItem).toHaveBeenCalledWith("menuActive", "false");
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("debe propagar el cambio de ripple hacia PrimeNG", () => {
    createComponent();

    component.onRippleChange({ checked: true });

    expect(appStub.ripple).toBeTrue();
    expect(primengConfigStub.ripple.set).toHaveBeenCalledWith(true);
  });
});
