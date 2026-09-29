import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdminComponent } from "src/app/admin/admin.component";
import { LoginService } from "src/app/services/login.service";
import { TopbarComponent } from "./topbar.component";

describe("TopbarComponent", () => {
  let fixture: ComponentFixture<TopbarComponent>;
  let component: TopbarComponent;
  let appMainStub: any;
  let loginServiceStub: any;

  beforeEach(async () => {
    appMainStub = {
      topbarItemClick: false,
    };
    loginServiceStub = {
      user: {
        first_name: "Ana",
        last_name: "Perez",
        roles: ["admin"],
        email: "ana@ups.edu.ec",
        image: "assets/img/usercard.png",
      },
      signOut: jasmine.createSpy("signOut"),
    };

    await TestBed.configureTestingModule({
      declarations: [TopbarComponent],
      providers: [
        { provide: AdminComponent, useValue: appMainStub },
        { provide: LoginService, useValue: loginServiceStub },
      ],
    })
      .overrideComponent(TopbarComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe exponer la informacion principal del usuario autenticado", () => {
    createComponent();

    expect(component.userFullName).toBe("Ana Perez");
    expect(component.userPrimaryRole).toBe("ADMIN");
    expect(component.userEmail).toBe("ana@ups.edu.ec");
    expect(component.userImage).toBe("assets/img/usercard.png");
    expect(component.profileRoute).toEqual(["/admin/profile"]);
  });

  it("debe usar valores fallback cuando faltan datos del usuario", () => {
    loginServiceStub.user = {
      first_name: "",
      last_name: "",
      roles: [],
      email: "",
      image: "",
    };

    createComponent();

    expect(component.userFullName).toBe("Usuario");
    expect(component.userPrimaryRole).toBe("");
    expect(component.userEmail).toBe("");
    expect(component.userImage).toBe("assets/img/noimage.png");
  });

  it("debe delegar el cierre de sesion al servicio", () => {
    createComponent();

    component.logOut();

    expect(loginServiceStub.signOut).toHaveBeenCalled();
  });

  it("debe marcar el click de topbar y frenar la propagacion del evento", () => {
    createComponent();
    const event = jasmine.createSpyObj<Event>("event", ["stopPropagation"]);

    component.onTopbarRegionClick(event);

    expect(appMainStub.topbarItemClick).toBeTrue();
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
