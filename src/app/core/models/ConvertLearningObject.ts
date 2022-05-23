import { ObjectLearning } from "../interfaces/ObjectLearning";

export class ConvertLearningObject {
  constructor() {}

  public static toObjectLearning(json: string): ObjectLearning {
    return JSON.parse(json);
  }

  public static objectLearningToJson(value: ObjectLearning): string {
    return JSON.stringify(value);
  }

  toJsonLearningObject(lom: any): ObjectLearning {
    var objectData;
    
    console.log("property", lom);

    let description_aux : any;
    if(lom?.general?.description){
      if (lom?.general?.description.length > 0){
        description_aux = lom?.general?.description.map(res => res.string["#text"]).join(", ");
       }else if(lom?.general?.description?.hasOwnProperty("#text")){
         description_aux = lom?.general?.description?.string["#text"] || "" ;
       }
      }
    
      let title_aux :any;
      if(lom?.general?.title?.hasOwnProperty("#text")){
        title_aux =lom?.general?.title?.string["#text"] || "" ;
      }else if(lom?.general?.title?.langstring){
        title_aux = lom?.general?.title?.langstring;
      }

    try {
      
      objectData = {
        general_catalog: lom?.general?.identifier?.catalog || "",
        general_entry: lom?.general?.identifier?.entry || "",
        general_title: title_aux,
        general_language: lom?.general?.language || "",
        general_description: description_aux ,
        general_keyword: this?.getStringData(lom?.general?.keyword?.string),
        general_coverage: lom?.general?.coverage?.string || "",
        general_structure: lom?.general?.structure?.value || "",
        general_aggregation_Level: lom?.general?.aggregationLevel?.value || "",
        life_cycle_version: lom?.lifeCycle?.version?.string["@language"] || "",
        life_cycle_status: lom?.lifeCycle?.status?.value || "",
        life_cycle_role: lom?.lifeCycle?.contribute
          ? lom?.lifeCycle?.contribute[0]?.role?.value
          : "",
        life_cycle_entity: lom?.lifeCycle?.contribute
          ? lom?.lifeCycle?.contribute[0]?.entity
          : "",
        life_cycle_dateTime: lom?.lifeCycle?.contribute
          ? lom?.lifeCycle?.contribute[0]?.date?.dateTime
          : "",
        life_cycle_description: lom?.lifeCycle?.contribute
          ? lom?.lifeCycle?.contribute[0]?.date?.description?.string
          : "",
        meta_metadata_catalog: lom?.metaMetadata?.identifier?.catalog || "",
        meta_metadata_entry: lom?.metaMetadata?.identifier?.entry || "",
        meta_metadata_role: lom?.metaMetadata?.contribute?.role?.value || "",
        meta_metadata_entity: lom?.metaMetadata?.contribute?.entity || "",
        meta_metadata_dateTime:
          lom?.metaMetadata?.contribute?.date?.dateTime || "",
        meta_metadata_description:
          lom?.metaMetadata?.contribute?.date?.description?.string || "",
        technical_format: lom?.technical?.format || "",
        technical_size: parseInt(lom?.technical?.size) || 0,
        technical_location: lom?.technical?.location || "",
        technical_requirement_type:
          lom?.technical?.requirement?.orComposite?.type?.value || "",
        technical_requirement_name:
          lom?.technical?.requirement?.orComposite?.name?.value || "",
        technical_requirement_minimumVersion:
          lom?.technical?.requirement?.orComposite?.minimumVersion || "",
        technical_installationRremarks:
          lom?.technical?.installationRemarks?.string["#text"] || "",
        technical_otherPlatformRequirements:
          lom?.technical?.otherPlatformRequirements?.string["#text"] || "",
        technical_dateTime: lom?.technical?.contribute?.date?.dateTime || "",
        technical_description:
          lom?.technical?.contribute?.date?.description?.string || "",
        educational_interactivityType:
          lom?.educational?.interactivityType?.value || "",
        educational_learningResourceType:
          lom?.educational?.learningResourceType?.value || "",
        educational_interactivityLevel:
          lom?.educational?.interactivityLevel?.value || "",
        educational_semanticDensity:
          lom?.educational?.semanticDensity?.value || "",
        educational_intendedEndUserRole:
          lom?.educational?.intendedEndUserRole?.value || "",
        educational_context: lom?.educational?.context?.value || "",
        educational_typicalAgeRange: lom?.educational?.typicalAgeRange
          ? lom.educational.typicalAgeRange[0]?.string["#text"]
          : "",
        educational_difficulty: lom?.educational?.difficulty?.value || "",
        educational_typicalLearningTime_dateTime:
          lom?.educational?.typicalLearningTime?.duration || "",
        educational_typicalLearningTime_description:
          lom?.educational?.typicalLearningTime?.description?.string["#text"] ||
          "",
        educational_description: lom?.educational?.description?.string || "",
        educational_language: lom?.educational?.language || "",
        educational_procces_cognitve:
          lom?.educational?.educational_procces_cognitve || "", //revisar la respuesta
        rights_cost: lom?.rights?.cost?.value || "",
        rights_copyrightAndOtherRestrictions:
          lom?.rights?.copyrightAndOtherRestrictions?.value || "",
        rights_description: lom?.rights?.description?.string || "",
        relation_kind: lom?.relation?.kind?.value || "",
        relation_catalog: lom?.relation?.resource?.identifier?.catalog || "",
        relation_entry: lom?.relation?.resource?.identifier?.entry || "", //revisar la respuesta
        relation_description:
          lom?.relation?.resource?.description?.string || "",
        annotation_entity: lom?.annotation?.entity || "",
        annotation_date_dateTime: lom?.annotation?.date?.dateTime || "",
        annotation_date_description:
          lom?.annotation?.date?.description?.string["#text"] || "",
        annotation_description:
          lom?.annotation?.description?.string["#text"] || "",
        annotation_modeaccess: lom?.annotation?.modeaccess?.value || "",
        annotation_modeaccesssufficient:
          lom?.annotation?.modeaccesssufficient?.value || "",
        annotation_rol: lom?.annotation?.Rol?.value,
        classification_purpose: lom?.classification?.purpose?.value || "",
        classification_taxonPath_source: lom?.classification?.taxonPath
          ? lom?.classification?.taxonPath[0]?.source?.string["#text"]
          : "",
        classification_taxonPath_taxon:
          lom?.classification?.taxonPath &&
          lom?.classification?.taxonPath[0]?.taxon
            ? lom?.classification?.taxonPath[0]?.taxon[0]?.entry?.string[
                "#text"
              ]
            : "",
        classification_description:
          lom?.classification?.description?.string["#text"] || "",
        classification_keyword: this?.getStringData(
          lom?.classification?.keyword?.string
        ),
        accesibility_summary: lom?.accesibility?.description?.string || "",
        accesibility_features: this?.getStringDataConcat(
          lom?.accesibility?.accessibilityfeatures?.resourcecontent?.br
        ),
        accesibility_hazard: this?.getStringDataConcat(
          lom?.accesibility?.accessibilityhazard?.properties?.br
        ),
        accesibility_control: this?.getStringDataConcat(
          lom?.accesibility?.accessibilitycontrol?.methods?.br
        ),

        accesibility_api: this?.getStringDataConcat(
          lom?.accesibility?.accessibilityAPI?.compatibleresource?.br
        ),
      };
    } catch (error) {
      console.log("Error load oa", error)
    }

    return objectData;
  }

  private getStringData(value: any): string {
    //console.log("Value", value);
    let Keyword = "";
    try {
      value?.forEach((element) => {
        Keyword += element["#text"] + ", ";
      }) || "";
    } catch (error) {
      Keyword = value["#text"] || "";
    }
    return Keyword;
  }

  private getStringDataConcat(value: any): string {
    //console.log("Value 2 ", value);
    let dataReturn = "";
    try {
      dataReturn = value.join();
    } catch (error) {}
    return dataReturn;
  }

}
