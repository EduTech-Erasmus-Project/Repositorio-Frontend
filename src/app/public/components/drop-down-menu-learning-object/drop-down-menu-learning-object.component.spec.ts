import { DropDownMenuLearningObjectComponent } from "./drop-down-menu-learning-object.component";

describe("DropDownMenuLearningObjectComponent", () => {
  let component: DropDownMenuLearningObjectComponent;
  const cdrStub = {
    detectChanges: () => undefined,
  } as any;

  beforeEach(() => {
    component = new DropDownMenuLearningObjectComponent(cdrStub);
  });

  it("arma el menu desde preview.toc y sincroniza el recurso seleccionado", async () => {
    component.object = {
      general_title: "Curso accesible",
      preview: {
        mode: "scorm",
        base_url: "https://example.com/preview/",
        entrypoint: "index.html",
        toc: [
          {
            title: "Modulo 1",
            resource_path: "",
            children: [
              {
                title: "Tema 1",
                resource_path: "module/topic-1.html",
                children: [],
              },
            ],
          },
        ],
      },
      learning_object_file: {
        url: "https://example.com/preview/module/topic-1.html",
      },
    } as any;

    await (component as any).buildMenu();

    expect(component.objectCollectionMenu?.title).toBe("Curso accesible");
    expect(component.objectCollectionMenu?.items.length).toBe(1);
    expect(component.selectedResourcePath).toBe("module/topic-1.html");
    expect(component.isExpanded(component.objectCollectionMenu!.items[0])).toBeTrue();
  });

  it("hace fallback a imsmanifest.xml cuando no existe preview.toc", async () => {
    const manifestXml = `
      <manifest>
        <organizations>
          <organization identifier="ORG-1">
            <title>Indice legacy</title>
            <item identifier="ITEM-1" identifierref="RES-1">
              <title>Inicio</title>
            </item>
          </organization>
        </organizations>
        <resources>
          <resource identifier="RES-1" href="pages/page-1.html"></resource>
        </resources>
      </manifest>
    `;
    spyOn(globalThis, "fetch").and.returnValue(
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(manifestXml),
      } as Response)
    );
    component.object = {
      general_title: "Legacy",
      learning_object_file: {
        url: "http://localhost:8000/media/catalog/legacy/index.html",
      },
    } as any;

    await (component as any).buildMenu();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/media/catalog/legacy/imsmanifest.xml"
    );
    expect(component.objectCollectionMenu?.title).toBe("Indice legacy");
    expect(component.objectCollectionMenu?.items[0].resource_path).toBe("pages/page-1.html");
    expect(component.menuLoadError).toBeFalse();
  });

  it("actualiza la url del iframe al activar un item con recurso", async () => {
    const manifestXml = `
      <manifest>
        <organizations>
          <organization identifier="ORG-1">
            <title>Indice legacy</title>
            <item identifier="ITEM-1" identifierref="RES-1">
              <title>Inicio</title>
            </item>
          </organization>
        </organizations>
        <resources>
          <resource identifier="RES-1" href="pages/page-1.html"></resource>
        </resources>
      </manifest>
    `;
    spyOn(globalThis, "fetch").and.returnValue(
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(manifestXml),
      } as Response)
    );
    component.object = {
      learning_object_file: {
        url: "http://localhost:8000/media/catalog/legacy/index.html",
      },
    } as any;
    await (component as any).buildMenu();

    const item = component.objectCollectionMenu!.items[0];
    component.onActivateItem(item);

    expect(component.object.learning_object_file.url).toBe(
      "http://localhost:8000/media/catalog/legacy/pages/page-1.html"
    );
    expect(component.selectedResourcePath).toBe("pages/page-1.html");
    expect(component.isExpanded(item)).toBeTrue();
  });

  it("abre o cierra ramas cuando el usuario alterna una rama del acordeon", async () => {
    component.object = {
      preview: {
        mode: "scorm",
        base_url: "https://example.com/preview/",
        entrypoint: "index.html",
        toc: [
          {
            title: "Unidad 1",
            resource_path: "",
            children: [
              {
                title: "Leccion 1",
                resource_path: "lesson-1.html",
                children: [],
              },
            ],
          },
        ],
      },
      learning_object_file: {
        url: "https://example.com/preview/index.html",
      },
    } as any;
    await (component as any).buildMenu();

    const branch = component.objectCollectionMenu!.items[0];
    expect(component.isExpanded(branch)).toBeTrue();

    component.onToggleBranch(new Event("click"), branch);
    expect(component.isExpanded(branch)).toBeFalse();

    component.onToggleBranch(new Event("click"), branch);
    expect(component.isExpanded(branch)).toBeTrue();
  });

  it("marca error de carga cuando el manifest legacy falla", async () => {
    spyOn(globalThis, "fetch").and.returnValue(Promise.reject(new Error("network")));
    component.object = {
      preview: {
        mode: "scorm",
        toc: [],
      },
      learning_object_file: {
        url: "http://localhost:8000/media/catalog/legacy/index.html",
      },
    } as any;

    await (component as any).buildMenu();

    expect(component.objectCollectionMenu).toBeNull();
    expect(component.menuLoadError).toBeTrue();
  });
});
