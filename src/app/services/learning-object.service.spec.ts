import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { environment } from "../../environments/environment";
import { LearningObjectService } from "./learning-object.service";

describe("LearningObjectService", () => {
  let service: LearningObjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LearningObjectService],
    });

    service = TestBed.inject(LearningObjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("debe consultar las areas de conocimiento", () => {
    const response = [{ id: 1, name: "Matematica" }];

    service.getLearningObject().subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/areas-de-conocimiento/`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe exponer la url de carga de archivos", () => {
    expect(service.urlUpload).toBe(`${environment.baseUrl}/learning-object-file/`);
  });

  it("debe subir un archivo comprimido como FormData", () => {
    const file = new File(["zip-content"], "oa.zip", {
      type: "application/zip",
    });

    service.uploadObject(file).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/learning-object-file/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get("file")).toBe(file);
    req.flush({ ok: true });
  });

  it("debe obtener el detalle del objeto por slug", () => {
    const response = { slug: "oa-de-prueba", title: "OA" };

    service.getObjectDetail("oa-de-prueba").subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-object/oa-de-prueba/`
    );
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe obtener el detalle del objeto por id", () => {
    const response = { id: 15, general_title: "OA" };

    service.getObjectDetailById(15).subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-object-metadata/15/`
    );
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe crear metadata del objeto como FormData", () => {
    const object = {
      general_title: "OA de prueba",
      general_description: "Descripcion de prueba",
    };

    service.addMetadata(object).subscribe((res: any) => {
      expect(res).toEqual({ id: 10 });
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/learning-object-metadata/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get("general_title")).toBe("OA de prueba");
    expect(req.request.body.get("general_description")).toBe("Descripcion de prueba");
    req.flush({ id: 10 });
  });

  it("debe editar metadata del objeto como FormData", () => {
    const object = {
      id: 22,
      general_title: "OA editado",
    };

    service.editMetadata(object).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-object-metadata/22/`
    );
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get("general_title")).toBe("OA editado");
    req.flush({ ok: true });
  });

  it("debe crear el contador de vistas", () => {
    const payload = {
      learning_object: 9,
      view: 1,
    };

    service.viewedCreateCount(payload).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/learning-objects/viewed`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ ok: true });
  });

  it("debe actualizar el contador de vistas", () => {
    const payload = {
      learning_object: 9,
      view: 2,
    };

    service.viewedUpdateCount(payload, 9).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/learning-objects/viewed/9`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(payload);
    req.flush({ ok: true });
  });

  it("debe consultar el contador de vistas", () => {
    const response = [{ learning_object: 9, view: 4 }];

    service.getViewedCount(9).subscribe((res: any) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/learning-objects/viewed/9`);
    expect(req.request.method).toBe("GET");
    req.flush(response);
  });

  it("debe solicitar la referencia de usuario para interacciones", () => {
    service.getReferenceUserView().subscribe((res: any) => {
      expect(res).toEqual({ key_ref: "abc123" });
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/interaction-ref/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({
      key_ref: "@-rcxionqt",
    });
    req.flush({ key_ref: "abc123" });
  });

  it("debe notificar al autor conservando el formato multilinea del mensaje", () => {
    const message = "HOLA MUNDO,\r\n\r\nQuiero presentar algo.\r\n\r\nAdios";

    service.notificationObjectTeacherAdmin(57, { message }).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/learning-objects-review-notification/57/`
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({
      message: "HOLA MUNDO,\n\nQuiero presentar algo.\n\nAdios",
    });
    req.flush({ ok: true });
  });

  it("debe enviar el motivo de eliminacion admin conservando el formato multilinea", () => {
    const message = "Linea uno\r\n\r\n\tLinea dos";

    service.deleteObjestTeacherAdmin(57, { message }).subscribe((res: any) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne((request) =>
      request.url === `${environment.baseUrl}/learning-object-file-delete-admin/57`
    );
    expect(req.request.method).toBe("DELETE");
    expect(req.request.params.get("message")).toBe("Linea uno\n\n\tLinea dos");
    req.flush({ ok: true });
  });

  it("debe enviar el archivo a OER Adapt", () => {
    const payload = {
      file: new File(["oa"], "oa.zip"),
    };

    service.set_learningObject(payload).subscribe((res: any) => {
      expect(res).toEqual({ status: "ok" });
    });

    const req = httpMock.expectOne(`${environment.oerUrl}/api/integration/receive_file/`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ status: "ok" });
  });
});
