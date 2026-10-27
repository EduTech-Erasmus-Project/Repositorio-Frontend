import { ElementRef, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { of, Subject, throwError } from "rxjs";
import { MessageService } from "primeng/api";
import { Router } from "@angular/router";
import { WebViewComponent } from "./web-view.component";
import { LoginService } from "../../../services/login.service";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { InteractionReferenceService } from "src/app/services/interaction-reference.service";
import { LanguageService } from "src/app/services/language.service";

@Pipe({
    name: "translate",
    standalone: false
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("WebViewComponent", () => {
  let fixture: ComponentFixture<WebViewComponent>;
  let component: WebViewComponent;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let learningObjectSpy: jasmine.SpyObj<LearningObjectService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let referenceServiceSpy: jasmine.SpyObj<InteractionReferenceService>;
  let selectedLearningObject$: Subject<any>;
  const instantTranslations: Record<string, string> = {
    "message.titleError": "Error",
    "message.titleSuccess": "Correcto",
    "object.loginRequiredAction": "Debe iniciar sesión para realizar esta acción",
    "object.interactionSaveError": "No se pudo guardar la interacción",
    "object.shareAuthor": "Autor",
    "object.shareEmail": "Correo",
    "object.shareLinkCopied": "Enlace copiado al portapapeles",
    "object.shareQrCopied": "Codigo QR copiado al portapapeles",
    "object.shareMessageIntro": "Mira este objeto de aprendizaje del ROA de la Universidad Politécnica Salesiana:",
    "object.shareTitle": "Título",
  };

  const objectBase: any = {
    id: 7,
    slug: "oa-prueba",
    general_title: "Objeto de prueba",
    general_description: "Descripcion del objeto",
    general_keyword: "algebra, prueba",
    rating: 4.5,
    source_file: "http://localhost:8000/media/source.elp",
    created: "2026-04-01T00:00:00Z",
    knowledge_area: {
      name: "Matematica",
    },
    education_levels: [{ description: "Pregrado" }],
    license: {
      description: "CC-BY",
    },
    user_created: {
      first_name: "Ana",
      last_name: "Lopez",
      image_url: "http://localhost:8000/media/profile/ana.png",
    },
    learning_object_file: {
      url: "http://localhost:8000/api/v1/learning-object-file/7/preview/token/index.html",
      file: "http://localhost:8000/api/v1/learning-object-file/7/download/token/",
    },
    preview: {
      mode: "scorm",
      base_url: "http://localhost:8000/api/v1/learning-object-file/7/preview/token/",
      entrypoint: "index.html",
      toc: [
        {
          title: "Pagina nueva",
          resource_path: "index.html",
          children: [],
        },
      ],
    },
  };

  beforeEach(async () => {
    selectedLearningObject$ = new Subject<any>();

    loginServiceSpy = jasmine.createSpyObj(
      "LoginService",
      ["validateRole"],
      {
        user: { id: 4, first_name: "Ana" },
      }
    );
    learningObjectSpy = jasmine.createSpyObj(
      "LearningObjectService",
      [
        "validateLike",
        "getdownloadCount",
        "getViewedCount",
        "registerView",
        "getObjectResultsEvaluation",
        "getObjectResultsEvaluationStudent",
        "registerDownload",
        "interactionLike",
        "interactionView",
      ],
      {
        selectedLearningObject$: selectedLearningObject$.asObservable(),
      }
    );
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    referenceServiceSpy = jasmine.createSpyObj("InteractionReferenceService", ["get"]);
    referenceServiceSpy.get.and.resolveTo("ref-001");

    loginServiceSpy.validateRole.and.callFake((role: string) => role === "student");
    learningObjectSpy.validateLike.and.returnValue(
      of({ liked: true, downloaded: 2, id: 12 })
    );
    learningObjectSpy.getdownloadCount.and.returnValue(of({ number: 5 }));
    learningObjectSpy.getViewedCount.and.returnValue(of([{ view: 3 }]));
    learningObjectSpy.registerView.and.returnValue(of([{ view: 4 }]));
    learningObjectSpy.getObjectResultsEvaluation.and.returnValue(of([]));
    learningObjectSpy.getObjectResultsEvaluationStudent.and.returnValue(of([]));
    learningObjectSpy.registerDownload.and.returnValue(of([{ downloaded: 3 }] as any));
    learningObjectSpy.interactionLike.and.returnValue(of({ liked: false }));
    learningObjectSpy.interactionView.and.returnValue(of({ liked: true }));

    await TestBed.configureTestingModule({
      declarations: [WebViewComponent, TranslatePipeMock],
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: LearningObjectService, useValue: learningObjectSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: InteractionReferenceService, useValue: referenceServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.callFake((key: string) => of(key)),
              instant: jasmine
                .createSpy("instant")
                .and.callFake((key: string) => instantTranslations[key] || ""),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(WebViewComponent, {
        set: {
          template: `
            <div class="web-view">
              <h2 class="web-view__title">{{ object.general_title }}</h2>
              <div class="web-view__creator-avatar">
                <img [src]="object.user_created?.image_url || ''" />
              </div>
              <p class="web-view__creator-name">
                {{ object.user_created.first_name + ' ' + object.user_created.last_name }}
              </p>
            </div>
          `,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WebViewComponent);
    component = fixture.componentInstance;
    component.object = { ...objectBase };
    spyOn(window, "open");
    fixture.detectChanges();
    await component.loadData();
    await component.loadDataExpertEvaluation();
    await component.loadDataStudentEvaluation();
    fixture.detectChanges();
  });

  it("debe renderizar el objeto y registrar la vista con la referencia firmada", () => {
    expect(component.youNeedMenu).toBeTrue();
    expect(component.liked).toBeTrue();
    expect(component.countDownloads).toBe(5);
    expect(component.countViews).toBe(4);

    expect(learningObjectSpy.validateLike).toHaveBeenCalledWith(7);
    expect(learningObjectSpy.getdownloadCount).toHaveBeenCalledWith(7);
    // Una sola vista por OA abierto, aunque el contexto se recargue.
    expect(learningObjectSpy.registerView).toHaveBeenCalledOnceWith(7, "ref-001");

    const title = fixture.nativeElement.querySelector(".web-view__title");
    const profileName = fixture.nativeElement.querySelector(".web-view__creator-name");
    const profileImage = fixture.nativeElement.querySelector(".web-view__creator-avatar img");

    expect(title?.textContent).toContain("Objeto de prueba");
    expect(profileName?.textContent).toContain("Ana Lopez");
    expect(profileImage?.getAttribute("src")).toBe(
      "http://localhost:8000/media/profile/ana.png"
    );
  });

  it("no debe ofrecer calificar como experto un OA propio", async () => {
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "teacher" || role === "expert");
    learningObjectSpy.getObjectResultsEvaluation.calls.reset();
    component.object = { ...objectBase, user_created: { ...objectBase.user_created, id: 4 } };

    await component.loadDataExpertEvaluation();

    expect(component.canEvaluateAsExpert).toBeFalse();
    expect(component.expertEvaluationStateResolved).toBeFalse();
    expect(learningObjectSpy.getObjectResultsEvaluation).not.toHaveBeenCalled();
  });

  it("debe ofrecer calificar como experto un OA ajeno", async () => {
    loginServiceSpy.validateRole.and.callFake((role: string) => role === "teacher" || role === "expert");
    component.object = { ...objectBase, user_created: { ...objectBase.user_created, id: 99 } };

    await component.loadDataExpertEvaluation();

    expect(component.canEvaluateAsExpert).toBeTrue();
    expect(component.expertEvaluationStateResolved).toBeTrue();
    expect(learningObjectSpy.getObjectResultsEvaluation).toHaveBeenCalledWith(7);
  });

  it("debe avisar a la pagina del OA tanto al crear como al editar la evaluacion", () => {
    const emitted: boolean[] = [];
    component.commentEmit1.subscribe((value) => emitted.push(value));

    component.coutComment1(true);
    component.flagQuestionsEx = true;
    component.coutComment(false);

    expect(emitted).toEqual([true, true]);
    expect(component.displayFormRatingExpert).toBeFalse();
  });

  it("debe exponer el user_key del autor solo cuando llega", () => {
    component.object = { ...objectBase, user_created: { ...objectBase.user_created, user_key: "abc-123" } };
    expect(component.authorKey).toBe("abc-123");

    component.object = { ...objectBase };
    expect(component.authorKey).toBeNull();
  });

  it("debe solicitar pantalla completa sobre el visor del OA", () => {
    const viewer = document.createElement("div");
    const requestFullscreen = jasmine.createSpy("requestFullscreen").and.returnValue(Promise.resolve());

    Object.defineProperty(viewer, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    component.viewer = new ElementRef(viewer);

    component.openFullscreen();

    expect(requestFullscreen).toHaveBeenCalled();
    expect(component.fullScreen).toBeTrue();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("debe registrar la vista sin referencia si el backend no la entrega", async () => {
    referenceServiceSpy.get.and.resolveTo(null);
    learningObjectSpy.registerView.calls.reset();

    const secondComponent = TestBed.createComponent(WebViewComponent).componentInstance;
    secondComponent.object = { ...objectBase, id: 15 };
    await secondComponent.loadData();

    expect(learningObjectSpy.registerView).toHaveBeenCalledOnceWith(15, null);
    expect(secondComponent.countViews).toBe(4);
  });

  it("debe mostrar el total aunque falle el registro de la vista", async () => {
    learningObjectSpy.registerView.and.returnValue(throwError(() => ({ status: 500 })));
    learningObjectSpy.getViewedCount.and.returnValue(of([{ view: 9 }]));

    const secondComponent = TestBed.createComponent(WebViewComponent).componentInstance;
    secondComponent.object = { ...objectBase, id: 16 };
    await secondComponent.loadData();

    expect(learningObjectSpy.getViewedCount).toHaveBeenCalledWith(16);
    expect(secondComponent.countViews).toBe(9);
  });

  it("debe reaccionar al cambio de objeto emitido desde selectedLearningObject$", async () => {
    const emittedObject = {
      ...objectBase,
      id: 20,
      general_title: "OA emitido",
      learning_object_file: {
        url: "http://localhost:8000/api/v1/learning-object-file/20/preview/token/index.html",
        file: "http://localhost:8000/api/v1/learning-object-file/20/download/token/",
      },
      preview: {
        mode: "html",
        base_url: "http://localhost:8000/api/v1/learning-object-file/20/preview/token/",
        entrypoint: "index.html",
        toc: [],
      },
    };

    learningObjectSpy.getdownloadCount.and.returnValue(of({ number: 8 }));
    learningObjectSpy.registerView.and.returnValue(of([{ view: 11 }]));

    selectedLearningObject$.next(emittedObject);
    await (component as any).refreshObjectContext();

    expect(component.object.id).toBe(20);
    expect(component.youNeedMenu).toBeFalse();
    expect(component.countDownloads).toBe(8);
    expect(component.countViews).toBe(11);
    expect(learningObjectSpy.registerView).toHaveBeenCalledWith(20, "ref-001");
  });

  it("debe descargar cuando el usuario tiene sesion activa", async () => {
    await component.onDownloadFile("http://localhost:8000/media/oa.zip");

    expect(window.open).toHaveBeenCalledWith(
      "http://localhost:8000/media/oa.zip",
      "_blank",
      "noopener,noreferrer"
    );
    await Promise.resolve();
    await fixture.whenStable();
    expect(learningObjectSpy.registerDownload).toHaveBeenCalledWith(7, "ref-001");
  });

  it("debe mostrar error si intenta descargar sin sesion", () => {
    Object.defineProperty(loginServiceSpy, "user", {
      get: () => null,
    });

    component.onDownloadFile("http://localhost:8000/media/oa.zip");

    expect(window.open).not.toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "Debe iniciar sesión para realizar esta acción",
    });
  });
  it("debe rechazar URLs externas no permitidas al descargar", async () => {
    await component.onDownloadFile("https://malicioso.example/oa.zip");

    expect(window.open).not.toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "La URL del recurso no es valida o no esta permitida.",
    });
  });

  it("debe actualizar el me gusta cuando ya existe una interaccion previa", async () => {
    await component.onLike();

    expect(learningObjectSpy.interactionLike).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 12,
        liked: false,
      })
    );
    expect(component.liked).toBeFalse();
  });

  it("debe revertir el me gusta si falla la actualizacion de la interaccion", async () => {
    learningObjectSpy.interactionLike.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    await component.onLike();

    expect(learningObjectSpy.interactionLike).toHaveBeenCalled();
    expect(component.liked).toBeTrue();
  });

  it("debe crear la interaccion de me gusta cuando aun no existe", async () => {
    component["interaction"] = undefined;
    component.liked = false;
    learningObjectSpy.interactionView.and.returnValue(
      of({ id: 80, liked: true, learning_object: 7 })
    );

    await component.onLike();

    expect(learningObjectSpy.interactionView).toHaveBeenCalledWith({
      liked: true,
      learning_object: 7,
    });
    expect(component["interaction"]).toEqual({
      id: 80,
      liked: true,
      learning_object: 7,
    });
    expect(component.liked).toBeTrue();
  });

  it("debe mostrar error cuando falla la creacion del me gusta", async () => {
    component["interaction"] = undefined;
    component.liked = false;
    learningObjectSpy.interactionView.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    await component.onLike();

    expect(learningObjectSpy.interactionView).toHaveBeenCalledWith({
      liked: true,
      learning_object: 7,
    });
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: "error",
        summary: "Error",
      })
    );
  });

  it("debe preparar las opciones de compartir con la URL publica del OA", () => {
    (component as any).openShareDialog();

    expect(component.displayShareDialog).toBeTrue();
    expect(component.shareOptions.map((option) => option.label)).toEqual([
      "WhatsApp",
      "Facebook",
      "LinkedIn",
      "Telegram",
      "Correo",
      "Reddit",
      "X",
    ]);
    expect(component.shareOptions[0].url).toContain(
      encodeURIComponent(`${window.location.origin}/#/object/oa-prueba`)
    );
  });

  it("debe generar el codigo QR con la URL publica del OA", async () => {
    await (component as any).generateShareQrCode();

    expect(component.shareQrCodeDataUrl).toContain("data:image/png;base64,");
    expect(component.shareQrCodeError).toBeFalse();
  });

  it("debe copiar el enlace publico del OA al portapapeles", async () => {
    const originalClipboard = navigator.clipboard;
    const writeText = jasmine.createSpy("writeText").and.returnValue(Promise.resolve());

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    try {
      component.displayShareDialog = true;

      await component.copyShareLink();

      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/#/object/oa-prueba`);
      expect(component.displayShareDialog).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: "success",
        summary: "Correcto",
        detail: "Enlace copiado al portapapeles",
      });
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: originalClipboard,
      });
    }
  });

  it("debe copiar el codigo QR como imagen al portapapeles", async () => {
    const originalClipboard = navigator.clipboard;
    const originalClipboardItem = (window as any).ClipboardItem;
    const write = jasmine.createSpy("write").and.returnValue(Promise.resolve());
    const clipboardItemConstructor = jasmine.createSpy("ClipboardItem");
    const qrBlob = new Blob(["qr"], { type: "image/png" });

    class ClipboardItemMock {
      constructor(data: any) {
        clipboardItemConstructor(data);
      }
    }

    spyOn(window, "fetch").and.returnValue(
      Promise.resolve({
        blob: () => Promise.resolve(qrBlob),
      } as Response)
    );

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write },
    });
    Object.defineProperty(window, "ClipboardItem", {
      configurable: true,
      value: ClipboardItemMock,
    });

    try {
      component.shareQrCodeDataUrl = "data:image/png;base64,abc";

      await component.copyShareQrCode();

      expect(window.fetch).toHaveBeenCalledWith("data:image/png;base64,abc");
      expect(clipboardItemConstructor).toHaveBeenCalledWith({ "image/png": qrBlob });
      expect(write).toHaveBeenCalled();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: "success",
        summary: "Correcto",
        detail: "Codigo QR copiado al portapapeles",
      });
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: originalClipboard,
      });
      Object.defineProperty(window, "ClipboardItem", {
        configurable: true,
        value: originalClipboardItem,
      });
    }
  });
});
