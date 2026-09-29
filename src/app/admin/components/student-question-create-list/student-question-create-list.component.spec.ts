import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { StudentQuestionCreateListComponent } from "./student-question-create-list.component";

describe("StudentQuestionCreateListComponent", () => {
  let component: StudentQuestionCreateListComponent;
  let fixture: ComponentFixture<StudentQuestionCreateListComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getEvaluationStudent",
      "postEvaluationStudent",
    ]);

    administratorServiceSpy.getEvaluationStudent.and.returnValue(
      of([{ id: 1, principle: "Percepcion" }] as any[])
    );
    administratorServiceSpy.postEvaluationStudent.and.returnValue(
      of({ id: 2, principle: "Nuevo principio" } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [StudentQuestionCreateListComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: AdminComponent, useValue: {} },
        { provide: ConfirmationService, useValue: jasmine.createSpyObj("ConfirmationService", ["confirm"]) },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StudentQuestionCreateListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(StudentQuestionCreateListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar principios al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getEvaluationStudent).toHaveBeenCalled();
    expect(component.principleList.length).toBe(1);
  });

  it("debe crear un principio valido", async () => {
    component.principle.principle = "  Nuevo principio  ";

    component.registerEvaluationData();
    await fixture.whenStable();

    expect(administratorServiceSpy.postEvaluationStudent).toHaveBeenCalled();
    expect(component.createPrincipleDialog).toBeFalse();
  });
});
