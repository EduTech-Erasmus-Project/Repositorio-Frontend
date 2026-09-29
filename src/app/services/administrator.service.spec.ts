import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { environment } from "src/environments/environment";
import { AdministratorService } from "./administrator.service";

describe("AdministratorService", () => {
  let service: AdministratorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdministratorService],
    });

    service = TestBed.inject(AdministratorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("debe consultar el total de objetos aprobados y desaprobados", () => {
    service.getTotalLearningObjectApprovedAndDisapproved().subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/total-oa-approved-and-disapproved/`
    );
    expect(req.request.method).toBe("GET");
    req.flush({ approved: 10, disapproved: 3 });
  });

  it("debe consultar el total de docentes y expertos", () => {
    service.getTotalTeacherAndExpert().subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/total-expert-teacher-approved-and-disapproved/`
    );
    expect(req.request.method).toBe("GET");
    req.flush({ total: 12 });
  });

  it("debe crear un concepto de evaluacion experta", () => {
    const payload = { description: "Contenido" } as any;

    service.postEvaluationExpert(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/object-learning-concept-evaluation/`
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });
  });

  it("debe actualizar un principio de evaluacion estudiantil", () => {
    const payload = { id: 7, title: "Claridad" } as any;

    service.putEvaluationStudent(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects/student-register-principles/7/`
    );
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 7 });
  });

  it("debe crear una directriz para estudiante", () => {
    const payload = { title: "Directriz" } as any;

    service.postGuidelineStudent(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects/student-register-guideline/`
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 2 });
  });

  it("debe crear una pregunta de evaluacion estudiantil", () => {
    const payload = { question: "Es util?" } as any;

    service.postQuestionStudent(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objective-assessment-student/`
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 3 });
  });

  it("debe eliminar una pregunta de autoevaluacion", () => {
    service.deleteSelfQuestion(4).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects/object-learning-question-evaluation-schema-delete/4`
    );
    expect(req.request.method).toBe("DELETE");
    req.flush({});
  });

  it("debe crear una pregunta de evaluacion automatica", () => {
    const payload = { question: "Tiene metadata?" } as any;

    service.postEvaluationAutomaticQuestion(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/object-learning-question-evaluation-schema/`
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 5 });
  });

  it("debe actualizar la relacion entre metadata y pregunta", () => {
    const payload = { id_schema: 8, question: 10 };

    service.putRelatioshipQuestionMetadata(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects/add-metadata-question-relationship/`
    );
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(payload);
    req.flush({ ok: true });
  });

  it("debe eliminar la relacion entre metadata y pregunta", () => {
    service.deleteRelatioshipQuestionMetadata({ id_schema: 8 }).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects/add-metadata-question-relationship/8`
    );
    expect(req.request.method).toBe("DELETE");
    req.flush({});
  });

  it("debe crear metadata experta", () => {
    const payload = { label: "General" } as any;

    service.postMetadataExpert(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objective-assessment-schema/`
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 11 });
  });

  it("debe actualizar una pregunta experta", () => {
    const payload = { id: 12, question: "Es reusable?" } as any;

    service.updateQuestionExpert(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objective-assessment-questions/12/`
    );
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 12 });
  });

  it("debe registrar un usuario administrador", () => {
    const payload = {
      email: "admin@test.com",
      first_name: "Admin",
      last_name: "Principal",
    } as any;

    service.registerAdministratorUser(payload).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/management-administrator/`
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 40 });
  });

  it("debe actualizar los datos del administrador con el payload transformado", () => {
    const user = {
      id: 25,
      first_name: "Ana",
      last_name: "Perez",
      administrator: {
        country: 1,
        city: 2,
        phone: "0999999999",
      },
    } as any;

    service.updateAdministratorDataUser(user).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/management-administrator/25/`
    );
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual({
      first_name: "Ana",
      last_name: "Perez",
      country: 1,
      city: 2,
      phone: "0999999999",
    });
    req.flush({ id: 25 });
  });

  it("debe listar administradores", () => {
    service.listAdministratorUser().subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/management-superuser/`);
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe listar objetos de aprendizaje con filtros", () => {
    service
      .listLearningObject(1, { general_title: "Algebra", public: "true" })
      .subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url ===
          `${environment.baseUrl}/learning-objects-approved-and-disapproved/1/` &&
        request.params.get("general_title") === "Algebra" &&
        request.params.get("public") === "true"
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe listar objetos de aprendizaje con paginacion", () => {
    service.listLearningObjectPagination(2, 4).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects-approved-and-disapproved/2/?page=4`
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe actualizar el estado publico o privado de un objeto", () => {
    service.updatePublicandPrivateLearningObject(13, 1).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects-update-public/13/`
    );
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ public: 1 });
    req.flush({ ok: true });
  });

  it("debe obtener el detalle del objeto por slug", () => {
    service.getLearningObject("oa-prueba").subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/learning-object/oa-prueba/`);
    expect(req.request.method).toBe("GET");
    req.flush({ slug: "oa-prueba" });
  });

  it("debe consultar expertos por aprobar con paginacion", () => {
    service.getExpertToAprove(2).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.baseUrl}/expert-to-approve/` &&
        request.params.get("page") === "2"
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe consultar docentes por aprobar con paginacion", () => {
    service.getTeacherToAprove(3).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.baseUrl}/teacher-to-approve/` &&
        request.params.get("page") === "3"
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe actualizar el estado de aprobacion de un docente", () => {
    service.updateTeacherToAprove(20, 1, 0).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/teacher-to-approve/20/`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual({
      teacher_is_active: 1,
      expert_is_active: 0,
    });
    req.flush({ ok: true });
  });

  it("debe eliminar un docente", () => {
    service.deleteUserTeacher(33).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/teacher-to-approve-delete/33`
    );
    expect(req.request.method).toBe("DELETE");
    req.flush({});
  });

  it("debe actualizar la aprobacion de un experto colaborador aprobado", () => {
    service.updateCollaboratingExpertAproved(21, 0, 1).subscribe();

    const req = httpMock.expectOne(`${environment.baseUrl}/expert-approved/21/`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual({
      teacher_is_active: 0,
      expert_is_active: 1,
    });
    req.flush({ ok: true });
  });

  it("debe consultar los objetos evaluados por experto", () => {
    service.getLearningObjectEvaluatedByExpert(15).subscribe();

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects/evaluated-expert/15`
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("debe consultar la lista de estudiantes para administracion con paginacion", () => {
    service.getStudentList(4).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.baseUrl}/student-list/by-admin/` &&
        request.params.get("page") === "4"
    );
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });
});
