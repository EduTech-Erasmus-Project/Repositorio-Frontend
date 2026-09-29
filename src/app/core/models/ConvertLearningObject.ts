import { ObjectLearning } from "../interfaces/ObjectLearning";
import { safeJsonParse } from "../utils/json.utils";

interface LomPayload {
  general?: {
    identifier?: { catalog?: unknown; entry?: unknown };
    title?: { title?: unknown };
    language?: { language?: string };
    description?: { description?: unknown };
    keyword?: { keyword?: unknown };
    coverage?: { coverage?: unknown };
    structure?: { value?: unknown };
    aggregationLevel?: { value?: unknown };
  };
  lifeCycle?: {
    version?: { version?: unknown };
    status?: { value?: unknown };
    contribute?: {
      role?: unknown;
      entity?: unknown;
      dateTime?: unknown;
      description?: unknown;
    };
  };
  metaMetadata?: {
    identifier?: { catalog?: unknown; entry?: unknown };
    contribute?: {
      value?: unknown;
      entity?: unknown;
      date?: unknown;
      description?: unknown;
    };
  };
  technical?: {
    format?: { format?: unknown };
    size?: { size?: unknown };
    location?: { location?: unknown };
    requirement?: {
      typeValue?: unknown;
      nameValue?: unknown;
      minVersion?: unknown;
    };
    installationRemarks?: { installationRemarks?: unknown };
    otherPlatformRequirements?: { otherPlatformRequirements?: unknown };
    contribute?: {
      date?: {
        dateTime?: string;
        description?: { string?: string };
      };
    };
  };
  educational?: {
    interactivityType?: { value?: unknown };
    learningResourceType?: { value?: unknown };
    interactivityLevel?: { value?: unknown };
    semanticDensity?: { value?: unknown };
    intendedEndUserRole?: { value?: unknown };
    context?: { value?: unknown };
    typicalAgeRange?: { typicalAgeRange?: unknown };
    difficulty?: { value?: unknown };
    typicalLearningTime?: { duration?: unknown; description?: unknown };
    description?: { description?: unknown };
    language?: { language?: unknown };
    educational_procces_cognitve?: string;
  };
  rights?: {
    cost?: { value?: string };
    copyrightAndOtherRestrictions?: { value?: string };
    description?: unknown;
  };
  relation?: {
    kind?: { value?: unknown };
    resource?: {
      catalog?: unknown;
      entry?: unknown;
      description?: unknown;
    };
  };
  annotation?: {
    entity?: { entity?: unknown };
    date?: { dateTime?: unknown; description?: unknown };
    description?: { description?: unknown };
    accessmode?: { value?: unknown };
    accessmodesufficient?: { value?: unknown };
    rol?: { value?: unknown };
  };
  classification?: {
    purpose?: { value?: unknown };
    taxonPath?: { source?: unknown; entry?: unknown };
    description?: { description?: unknown };
    keyword?: { keyword?: unknown };
  };
  accesibility?: {
    description?: { description?: unknown };
    accessibilityFeatures?: { value?: unknown };
    accessibilityHazard?: { value?: unknown };
    accessibilityControl?: { value?: unknown };
    accessibilityApi?: { value?: unknown };
  };
}

export class ConvertLearningObject {
  constructor() {}

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  public static toObjectLearning(json: string): ObjectLearning {
    return safeJsonParse<ObjectLearning>(json, {} as ObjectLearning);
  }

  public static objectLearningToJson(value: ObjectLearning): string {
    return JSON.stringify(value);
  }

  toJsonLearningObject(lom: unknown): ObjectLearning {
    const parsedLom = (lom ?? {}) as LomPayload;
    let objectData: ObjectLearning = {
      source_file: null,
      is_adapted_oer: false,
    };
    //console.log("property", lom);

    try {
      objectData = {
        ...objectData,
        general_catalog: this.methodCodification(parsedLom.general?.identifier?.catalog) || "",
        general_entry: this.methodCodification(parsedLom.general?.identifier?.entry) || "",
        general_title: this.methodCodification(parsedLom.general?.title?.title) || "",
        general_language: parsedLom.general?.language?.language || "",
        general_description: this.methodCodification(parsedLom.general?.description?.description) || "",
        general_keyword: this.joinValues(parsedLom.general?.keyword?.keyword),
        general_coverage: this.methodCodification(parsedLom.general?.coverage?.coverage) || "",
        general_structure: this.methodCodification(parsedLom.general?.structure?.value) || "",
        general_aggregation_Level: this.methodCodification(parsedLom.general?.aggregationLevel?.value) || "",
        life_cycle_version: this.methodCodification(parsedLom.lifeCycle?.version?.version) || "",
        life_cycle_status: this.methodCodification(parsedLom.lifeCycle?.status?.value) || "",
        life_cycle_role: this.methodCodification(parsedLom.lifeCycle?.contribute?.role) || "",
        life_cycle_entity: this.methodCodification(parsedLom.lifeCycle?.contribute?.entity)|| "",
        life_cycle_dateTime: this.methodCodification(parsedLom.lifeCycle?.contribute?.dateTime) || "",
        life_cycle_description: this.methodCodification(parsedLom.lifeCycle?.contribute?.description) || "",
        meta_metadata_catalog: this.methodCodification(parsedLom.metaMetadata?.identifier?.catalog) || "",
        meta_metadata_entry: this.methodCodification(parsedLom.metaMetadata?.identifier?.entry) || "",
        meta_metadata_role: this.methodCodification(parsedLom.metaMetadata?.contribute?.value) || "",
        meta_metadata_entity: this.methodCodification(parsedLom.metaMetadata?.contribute?.entity) || "",
        meta_metadata_dateTime: this.methodCodification(parsedLom.metaMetadata?.contribute?.date) || "",
        meta_metadata_description: this.joinValues(parsedLom.metaMetadata?.contribute?.description),
        technical_format: this.methodCodification(parsedLom.technical?.format?.format) || "",
        technical_size: this.methodCodification(parsedLom.technical?.size?.size) || "",
        technical_location: this.methodCodification(parsedLom.technical?.location?.location) || "",
        technical_requirement_type: this.methodCodification(parsedLom.technical?.requirement?.typeValue) || "",
        technical_requirement_name: this.methodCodification(parsedLom.technical?.requirement?.nameValue) || "",
        technical_requirement_minimumVersion: this.methodCodification(parsedLom.technical?.requirement?.minVersion) || "",
        technical_installationRremarks: this.methodCodification(parsedLom.technical?.installationRemarks?.installationRemarks) || "",
        technical_otherPlatformRequirements:this.methodCodification(parsedLom.technical?.otherPlatformRequirements?.otherPlatformRequirements) || "",
        //Para revision con otros objetos de aprendizaje
        technical_dateTime: parsedLom.technical?.contribute?.date?.dateTime || "",
        //Para revision con otros objeto de aprendizaje
        technical_description:parsedLom.technical?.contribute?.date?.description?.string || "",
        educational_interactivityType:this.methodCodification(parsedLom.educational?.interactivityType?.value)|| "",
        educational_learningResourceType: this.methodCodification(parsedLom.educational?.learningResourceType?.value) || "",
        educational_interactivityLevel: this.methodCodification(parsedLom.educational?.interactivityLevel?.value) || "",
        educational_semanticDensity: this.methodCodification(parsedLom.educational?.semanticDensity?.value) || "",
        educational_intendedEndUserRole: this.methodCodification(parsedLom.educational?.intendedEndUserRole?.value) || "",
        educational_context: this.methodCodification(parsedLom.educational?.context?.value) || "",
        educational_typicalAgeRange: this.methodCodification(parsedLom.educational?.typicalAgeRange?.typicalAgeRange) || "",
        educational_difficulty: this.methodCodification(parsedLom.educational?.difficulty?.value) || "",
        educational_typicalLearningTime_dateTime: this.methodCodification(parsedLom.educational?.typicalLearningTime?.duration)|| "",
        educational_typicalLearningTime_description: this.joinValues(parsedLom.educational?.typicalLearningTime?.description),
        educational_description: this.methodCodification(parsedLom.educational?.description?.description) || "",
        educational_language: this.methodCodification(parsedLom.educational?.language?.language) || "",
        //Revisar con otros obejtos de aprendizaje
        educational_procces_cognitve: parsedLom.educational?.educational_procces_cognitve || "", 
        rights_cost: parsedLom.rights?.cost?.value || "",
        rights_copyrightAndOtherRestrictions:parsedLom.rights?.copyrightAndOtherRestrictions?.value || "",
        rights_description: this.methodCodification(parsedLom.rights?.description) || "",
        relation_kind: this.methodCodification(parsedLom.relation?.kind?.value) || "",
        relation_catalog: this.methodCodification(parsedLom.relation?.resource?.catalog) || "",
        relation_entry: this.methodCodification(parsedLom.relation?.resource?.entry) || "", 
        relation_description:this.methodCodification(parsedLom.relation?.resource?.description) || "",
        annotation_entity: this.methodCodification(parsedLom.annotation?.entity?.entity) || "",
        annotation_date_dateTime: this.methodCodification(parsedLom.annotation?.date?.dateTime) || "",
        annotation_date_description: this.joinValues(parsedLom.annotation?.date?.description),
        annotation_description: this.methodCodification(parsedLom.annotation?.description?.description) || "",
        annotation_modeaccess: this.joinValues(parsedLom.annotation?.accessmode?.value),
        annotation_modeaccesssufficient: this.joinValues(parsedLom.annotation?.accessmodesufficient?.value),
        annotation_rol:  this.methodCodification(parsedLom.annotation?.rol?.value),
        classification_purpose: this.joinValues(parsedLom.classification?.purpose?.value),
        classification_taxonPath_source:  this.methodCodification(parsedLom.classification?.taxonPath?.source) || "",
        classification_taxonPath_taxon: this.joinValues(parsedLom.classification?.taxonPath?.entry),
        classification_description: this.methodCodification(parsedLom.classification?.description?.description) || "",
        //verificar con otro obejtos de aprendizaje
        classification_keyword: this.methodCodification(parsedLom.classification?.keyword?.keyword) || '',
        accesibility_summary: this.methodCodification(parsedLom.accesibility?.description?.description) || "",
        accesibility_features: this.joinValues(parsedLom.accesibility?.accessibilityFeatures?.value),
        accesibility_hazard: this.joinValues(parsedLom.accesibility?.accessibilityHazard?.value),
        accesibility_control: this.joinValues(parsedLom.accesibility?.accessibilityControl?.value),
        accesibility_api: this.joinValues(parsedLom.accesibility?.accessibilityApi?.value),
      };
    } catch (error) {
      console.log("Error load oa", error)
    }

    return objectData;
  }

  private methodCodification(text: unknown): string {
    if (text === undefined || text === null) {
      return "";
    }

    if (Array.isArray(text)) {
      return text.length > 0 ? this.methodCodification(text[0]) : "";
    }

    if (typeof text === "string" || typeof text === "number" || typeof text === "boolean") {
      return `${text}`;
    }

    if (ConvertLearningObject.isRecord(text) && text["#text"] !== undefined) {
      return `${text["#text"]}`;
    }

    return "";
  }

  private joinValues(value: unknown): string {
    if (value === undefined || value === null) {
      return "";
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => this.methodCodification(item))
        .filter((item) => item !== "")
        .join(", ");
    }

    return this.methodCodification(value);
  }

  private getStringData(value: unknown): string {
    let Keyword = "";
    try {
      (Array.isArray(value) ? value : []).forEach((element) => {
        if (ConvertLearningObject.isRecord(element) && element["#text"] !== undefined) {
          Keyword += `${element["#text"]}, `;
        }
      });
    } catch {
      if (ConvertLearningObject.isRecord(value) && value["#text"] !== undefined) {
        Keyword = `${value["#text"]}`;
      }
    }
    return Keyword;
  }

  private getStringDataConcat(value: unknown): string {
    let dataReturn = "";
    try {
      dataReturn = Array.isArray(value) ? value.join() : "";
    } catch {
      dataReturn = `${value ?? ""}`;
    }
    return dataReturn;
  }

}
