import {
  buildLegacyManifestUrl,
  isLegacyManifestCandidate,
  shouldDisplayLearningObjectMenu,
} from "./learning-object-preview";

describe("learning-object-preview utils", () => {
  it("debe detectar candidatos legacy basados en html", () => {
    expect(isLegacyManifestCandidate("https://demo.test/course/index.html")).toBeTrue();
    expect(
      isLegacyManifestCandidate("https://demo.test/course/website_index.html")
    ).toBeFalse();
    expect(isLegacyManifestCandidate("https://demo.test/course/imsmanifest.xml")).toBeFalse();
  });

  it("debe mostrar menu cuando el preview ya trae toc", () => {
    expect(
      shouldDisplayLearningObjectMenu({
        preview: {
          mode: "scorm",
          toc: [{ title: "Inicio", resource_path: "index.html", children: [] }],
        },
      })
    ).toBeTrue();
  });

  it("no debe mostrar menu en previews html sin toc", () => {
    expect(
      shouldDisplayLearningObjectMenu({
        preview: {
          mode: "html",
          toc: [],
        },
        learning_object_file: {
          url: "https://demo.test/course/website_index.html",
        },
      })
    ).toBeFalse();
  });

  it("debe usar fallback legacy cuando el archivo principal es html", () => {
    expect(
      shouldDisplayLearningObjectMenu({
        preview: {
          mode: "scorm",
          toc: [],
        },
        learning_object_file: {
          url: "https://demo.test/course/index.html",
        },
      })
    ).toBeTrue();
  });

  it("debe reconstruir la url del imsmanifest para paquetes legacy", () => {
    expect(
      buildLegacyManifestUrl("https://demo.test/course/index.html")
    ).toBe("https://demo.test/course/imsmanifest.xml");
    expect(buildLegacyManifestUrl("nota-valida")).toBeNull();
  });
});
