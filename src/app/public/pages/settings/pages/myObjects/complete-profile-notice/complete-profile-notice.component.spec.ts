import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { OwnPublicProfile } from "src/app/core/interfaces/PublicProfile";
import { PublicProfileService } from "src/app/services/public-profile.service";
import { COMPLETE_PROFILE_NOTICE_KEY, CompleteProfileNoticeComponent } from "./complete-profile-notice.component";

const emptyProfile = {
  headline: "",
  faculty: "",
  bio: "",
  research_group: "",
  research_lines: [],
  subjects: [],
  links: [],
  degrees: [],
} as unknown as OwnPublicProfile;

describe("CompleteProfileNoticeComponent", () => {
  let fixture: ComponentFixture<CompleteProfileNoticeComponent>;
  let component: CompleteProfileNoticeComponent;
  let serviceSpy: jasmine.SpyObj<PublicProfileService>;

  beforeEach(async () => {
    localStorage.removeItem(COMPLETE_PROFILE_NOTICE_KEY);
    serviceSpy = jasmine.createSpyObj("PublicProfileService", ["getOwnProfile"]);
    serviceSpy.getOwnProfile.and.returnValue(of(emptyProfile));

    await TestBed.configureTestingModule({
      declarations: [CompleteProfileNoticeComponent],
      providers: [{ provide: PublicProfileService, useValue: serviceSpy }],
    })
      .overrideComponent(CompleteProfileNoticeComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(CompleteProfileNoticeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => localStorage.removeItem(COMPLETE_PROFILE_NOTICE_KEY));

  it("debe mostrarse si el perfil esta vacio", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.visible()).toBeTrue();
  });

  it("no debe mostrarse si el perfil tiene algun dato", async () => {
    serviceSpy.getOwnProfile.and.returnValue(of({ ...emptyProfile, links: [{ type: "orcid", url: "https://orcid.org/x" }] }));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.visible()).toBeFalse();
  });

  it("no debe mostrarse si falla la consulta", async () => {
    serviceSpy.getOwnProfile.and.returnValue(throwError(() => new Error("500")));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.visible()).toBeFalse();
  });

  it("debe recordar que se cerro y no volver a consultar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.dismiss();

    expect(component.visible()).toBeFalse();
    expect(localStorage.getItem(COMPLETE_PROFILE_NOTICE_KEY)).toBe("1");

    serviceSpy.getOwnProfile.calls.reset();
    const second = TestBed.createComponent(CompleteProfileNoticeComponent);
    second.detectChanges();

    expect(serviceSpy.getOwnProfile).not.toHaveBeenCalled();
  });
});
