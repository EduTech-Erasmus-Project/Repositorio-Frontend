import { IframeIntegratedMenuComponent } from "./iframe-integrated-menu.component";

describe("IframeIntegratedMenuComponent", () => {
  let component: IframeIntegratedMenuComponent;

  beforeEach(() => {
    component = new IframeIntegratedMenuComponent();
  });

  it("detecta cuando debe mostrarse el menu desde el objeto", () => {
    component.object = {
      preview: {
        mode: "scorm",
        base_url: "https://example.com/preview/",
        entrypoint: "index.html",
        toc: [{ title: "Inicio", resource_path: "index.html", children: [] }],
      },
      learning_object_file: {
        url: "https://example.com/preview/index.html",
      },
    } as any;

    component.ngOnInit();

    expect(component.youNeedMenu).toBeTrue();
  });

  it("usa la url actual del archivo como iframeSource cuando existe", () => {
    component.object = {
      learning_object_file: {
        url: "https://example.com/current/page.html",
      },
      preview: {
        base_url: "https://example.com/preview/",
        entrypoint: "index.html",
        toc: [],
        mode: "html",
      },
    } as any;

    expect(component.iframeSource).toBe("https://example.com/current/page.html");
  });

  it("construye una url de preview cuando el archivo actual no existe", () => {
    component.object = {
      preview: {
        base_url: "https://example.com/preview/",
        entrypoint: "course/index.html",
        toc: [],
        mode: "scorm",
      },
      learning_object_file: undefined,
    } as any;

    expect(component.iframeSource).toBe("https://example.com/preview/course/index.html");
  });

  it("no muestra menu cuando el objeto no cumple las condiciones de preview", () => {
    component.object = {
      preview: {
        mode: "html",
        base_url: "https://example.com/preview/",
        entrypoint: "index.html",
        toc: [],
      },
      learning_object_file: {
        url: "https://example.com/preview/index.html",
      },
    } as any;

    component.ngOnInit();

    expect(component.youNeedMenu).toBeFalse();
  });
});
