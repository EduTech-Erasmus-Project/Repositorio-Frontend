import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { MetadataQuestionCreateListComponent } from "./metadata-question-create-list.component";

describe("MetadataQuestionCreateListComponent", () => {
  let component: MetadataQuestionCreateListComponent;
  let fixture: ComponentFixture<MetadataQuestionCreateListComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getEvaluationAutomatic",
      "postMetadataExpert",
      "retrieveEvaluationAutomatic",
    ]);

    administratorServiceSpy.getEvaluationAutomatic.and.returnValue(
      of([{ id: 1, concept: "Automatico" }] as any[])
    );
    administratorServiceSpy.postMetadataExpert.and.returnValue(of({ id: 5 } as any));
    administratorServiceSpy.retrieveEvaluationAutomatic.and.returnValue(
      of({ schemas: [{ id: 8, schema: "Meta" }] } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [MetadataQuestionCreateListComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        { provide: AdminComponent, useValue: {} },
        { provide: ConfirmationService, useValue: jasmine.createSpyObj("ConfirmationService", ["confirm"]) },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(MetadataQuestionCreateListComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(MetadataQuestionCreateListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar conceptos automaticos al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getEvaluationAutomatic).toHaveBeenCalled();
    expect(component.conceptList.length).toBe(1);
  });

  it("debe crear un metadato cuando el concepto esta seleccionado", async () => {
    component.conceptSelect.id = 1;
    component.schema.schema = "titulo";
    component.schema.code = "1.2";
    component.schema.description = "Descripcion";
    component.schema.value_importance_schema = 5 as any;

    component.saveSchema();
    await fixture.whenStable();

    expect(administratorServiceSpy.postMetadataExpert).toHaveBeenCalled();
    expect(administratorServiceSpy.retrieveEvaluationAutomatic).toHaveBeenCalledWith(1);
  });
});
