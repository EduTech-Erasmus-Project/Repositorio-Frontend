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

    /*
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
      }*/
    try {
      
      objectData = {
        general_catalog: lom?.general?.identifier?.catalog[0] || "",
        general_entry: lom?.general?.identifier?.entry[0] || "",
        general_title: lom?.general?.title?.title[0],
        general_language: lom?.general?.language?.language || "",
        general_description: lom?.general?.description?.description[0] || "",
        general_keyword: lom?.general?.keyword?.keyword.join(", ") || "",
        general_coverage: lom?.general?.coverage?.coverage[0] || "",
        general_structure: lom?.general?.structure?.value[0] || "",
        general_aggregation_Level: lom?.general?.aggregationLevel?.value[0] || "",
        life_cycle_version: lom?.lifeCycle?.version?.version[0] || "",
        life_cycle_status: lom?.lifeCycle?.status?.value[0] || "",
        life_cycle_role: lom?.lifeCycle?.contribute?.role[0] || "",
        life_cycle_entity:lom?.lifeCycle?.contribute?.entity[0]|| "",
        life_cycle_dateTime: lom?.lifeCycle?.contribute?.dateTime[0] || "",
        life_cycle_description:lom?.lifeCycle?.contribute?.description[0] || "",
        meta_metadata_catalog: lom?.metaMetadata?.identifier?.catalog[0] || "",
        meta_metadata_entry: lom?.metaMetadata?.identifier?.entry[0] || "",
        meta_metadata_role: lom?.metaMetadata?.contribute?.value[0] || "",
        meta_metadata_entity: lom?.metaMetadata?.contribute?.entity[0] || "",
        meta_metadata_dateTime:lom?.metaMetadata?.contribute?.date[0] || "",
        meta_metadata_description:  lom?.metaMetadata?.contribute?.description.join(", ") || "",
        technical_format: lom?.technical?.format.format[0] || "",
        technical_size: lom?.technical?.size.size[0] || 0,
        technical_location: lom?.technical?.location?.location[0] || "",
        technical_requirement_type:lom?.technical?.requirement?.typeValue[0] || "",
        technical_requirement_name: lom?.technical?.requirement?.nameValue[0] || "",
        technical_requirement_minimumVersion:lom?.technical?.requirement?.minVersion[0] || "",
        technical_installationRremarks: lom?.technical?.installationRemarks?.installationRemarks[0] || "",
        technical_otherPlatformRequirements:lom?.technical?.otherPlatformRequirements?.otherPlatformRequirements[0] || "",
        //Para revision con otros objetos de aprendizaje
        technical_dateTime: lom?.technical?.contribute?.date?.dateTime || "",
        //Para revision con otros objeto de aprendizaje
        technical_description:lom?.technical?.contribute?.date?.description?.string || "",
        educational_interactivityType:lom?.educational?.interactivityType?.value[0] || "",
        educational_learningResourceType:lom?.educational?.learningResourceType?.value[0] || "",
        educational_interactivityLevel:lom?.educational?.interactivityLevel?.value[0] || "",
        educational_semanticDensity:lom?.educational?.semanticDensity?.value[0] || "",
        educational_intendedEndUserRole: lom?.educational?.intendedEndUserRole?.value[0] || "",
        educational_context: lom?.educational?.context?.value[0] || "",
        educational_typicalAgeRange:lom.educational.typicalAgeRange?.typicalAgeRange[0] || "",
        educational_difficulty: lom?.educational?.difficulty?.value[0] || "",
        educational_typicalLearningTime_dateTime: lom?.educational?.typicalLearningTime?.duration[0]|| "",
        educational_typicalLearningTime_description:lom?.educational?.typicalLearningTime?.description?.join(", ") || "",
        educational_description: lom?.educational?.description?.description[0] || "",
        educational_language: lom?.educational?.language?.language[0] || "",
        //Revisar con otros obejtos de aprendizaje
        educational_procces_cognitve: lom?.educational?.educational_procces_cognitve || "", 
        rights_cost: lom?.rights?.cost?.value || "",
        rights_copyrightAndOtherRestrictions:lom?.rights?.copyrightAndOtherRestrictions?.value || "",
        rights_description: lom?.rights?.description[0] || "",
        relation_kind: lom?.relation?.kind?.value[0] || "",
        relation_catalog: lom?.relation?.resource?.catalog[0] || "",
        relation_entry: lom?.relation?.resource?.entry[0] || "", 
        relation_description:lom?.relation?.resource?.description[0] || "",
        annotation_entity: lom?.annotation?.entity?.entity[0] || "",
        annotation_date_dateTime: lom?.annotation?.date?.dateTime[0] || "",
        annotation_date_description:lom?.annotation?.date?.description.join(", ") || "",
        annotation_description:lom?.annotation?.description?.description[0] || "",
        annotation_modeaccess: lom?.annotation?.accessmode?.value[0] || "",
        annotation_modeaccesssufficient: lom?.annotation?.accessmodesufficient?.value[0] || "",
        annotation_rol: lom?.annotation?.rol?.value[0],
        classification_purpose: lom?.classification?.purpose?.value[0] || "",
        classification_taxonPath_source: lom?.classification?.taxonPath.source[0] || "",
        classification_taxonPath_taxon: lom?.classification?.taxonPath.entry.join(", ") || "",
        classification_description: lom?.classification?.description?.description[0] || "",
        //verificar con otro obejtos de aprendizaje
        classification_keyword: lom?.classification?.keyword?.keyword ? lom?.classification?.keyword?.keyword[0] : '',
        accesibility_summary: lom?.accesibility?.description?.description[0] || "",
        accesibility_features: lom?.accesibility?.accessibilityFeatures?.value.join(", ") || "",
        accesibility_hazard: lom?.accesibility?.accessibilityHazard?.value.join(", ") || "",
        accesibility_control: lom?.accesibility?.accessibilityControl?.value.join(", ") || "",
        accesibility_api: lom?.accesibility?.accessibilityApi?.value.join(", ") || "",
      };
    } catch (error) {
      console.log("Error load oa", error)
    }

    return objectData;
  }

  private methodConficion(text){
    return  text['#text'] ?  text["#text"] || '': text || '';
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
