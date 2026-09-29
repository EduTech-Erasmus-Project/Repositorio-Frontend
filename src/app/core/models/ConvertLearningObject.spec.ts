import { ConvertLearningObject } from "./ConvertLearningObject";

describe("ConvertLearningObject", () => {
  let convert: ConvertLearningObject;

  beforeEach(() => {
    convert = new ConvertLearningObject();
  });

  it("debe convertir desde y hacia JSON", () => {
    const object = {
      source_file: null,
      is_adapted_oer: false,
      general_title: "OA de prueba",
      general_description: "Descripcion",
    };

    const json = ConvertLearningObject.objectLearningToJson(object as any);
    const parsed = ConvertLearningObject.toObjectLearning(json);

    expect(parsed).toEqual(object as any);
  });

  it("debe mapear correctamente un LOM completo", () => {
    const lom = {
      general: {
        identifier: {
          catalog: ["URI"],
          entry: ["oa-001"],
        },
        title: {
          title: ["Algebra basica"],
        },
        language: {
          language: "es",
        },
        description: {
          description: ["Descripcion general"],
        },
        keyword: {
          keyword: ["matematica", "algebra"],
        },
      },
      lifeCycle: {
        version: {
          version: ["1.0"],
        },
        status: {
          value: ["final"],
        },
      },
      technical: {
        format: {
          format: ["application/zip"],
        },
        size: {
          size: ["2048"],
        },
        location: {
          location: ["http://localhost/oa.zip"],
        },
      },
      educational: {
        context: {
          value: ["universidad"],
        },
        description: {
          description: ["Descripcion educativa"],
        },
        language: {
          language: ["es"],
        },
      },
      rights: {
        description: ["Licencia abierta"],
      },
      annotation: {
        accessmode: {
          value: ["visual", "textual"],
        },
        accessmodesufficient: {
          value: ["textual"],
        },
      },
      accesibility: {
        accessibilityFeatures: {
          value: ["longDescription", "captions"],
        },
      },
    };

    const result = convert.toJsonLearningObject(lom);

    expect(result.general_catalog).toBe("URI");
    expect(result.general_entry).toBe("oa-001");
    expect(result.general_title).toBe("Algebra basica");
    expect(result.general_language).toBe("es");
    expect(result.general_description).toBe("Descripcion general");
    expect(result.general_keyword).toBe("matematica, algebra");
    expect(result.life_cycle_version).toBe("1.0");
    expect(result.life_cycle_status).toBe("final");
    expect(result.technical_format).toBe("application/zip");
    expect(result.technical_size).toBe("2048" as any);
    expect(result.technical_location).toBe("http://localhost/oa.zip");
    expect(result.educational_context).toBe("universidad");
    expect(result.educational_description).toBe("Descripcion educativa");
    expect(result.educational_language).toBe("es");
    expect(result.rights_description).toBe("Licencia abierta");
    expect(result.annotation_modeaccess).toBe("visual, textual");
    expect(result.annotation_modeaccesssufficient).toBe("textual");
    expect(result.accesibility_features).toBe("longDescription, captions");
    expect(result.source_file).toBeNull();
    expect(result.is_adapted_oer).toBeFalse();
  });

  it("debe soportar valores directos como string sin truncarlos", () => {
    const lom = {
      general: {
        title: {
          title: "Titulo directo",
        },
        description: {
          description: "Descripcion directa",
        },
      },
      lifeCycle: {
        version: {
          version: "2.5",
        },
      },
      rights: {
        description: "CC-BY",
      },
    };

    const result = convert.toJsonLearningObject(lom);

    expect(result.general_title).toBe("Titulo directo");
    expect(result.general_description).toBe("Descripcion directa");
    expect(result.life_cycle_version).toBe("2.5");
    expect(result.rights_description).toBe("CC-BY");
  });

  it("debe devolver un objeto valido cuando el metadata llega incompleto", () => {
    const result = convert.toJsonLearningObject({
      general: {
        title: {
          title: ["OA incompleto"],
        },
      },
    });

    expect(result).toBeTruthy();
    expect(result.general_title).toBe("OA incompleto");
    expect(result.technical_format).toBe("");
    expect(result.annotation_modeaccesssufficient).toBe("");
    expect(result.classification_taxonPath_source).toBe("");
    expect(result.accesibility_features).toBe("");
    expect(result.source_file).toBeNull();
    expect(result.is_adapted_oer).toBeFalse();
  });
});
