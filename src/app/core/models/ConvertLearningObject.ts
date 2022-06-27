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
        general_catalog: this.methodCodification(lom?.general?.identifier?.catalog) || "",
        general_entry: this.methodCodification(lom?.general?.identifier?.entry) || "",
        general_title: this.methodCodification(lom?.general?.title?.title),
        general_language: lom?.general?.language?.language || "",
        general_description: this.methodCodification(lom?.general?.description?.description) || "",
        general_keyword: lom?.general?.keyword?.keyword.join(", ") || "",
        general_coverage: this.methodCodification(lom?.general?.coverage?.coverage) || "",
        general_structure: this.methodCodification(lom?.general?.structure?.value) || "",
        general_aggregation_Level: this.methodCodification(lom?.general?.aggregationLevel?.value) || "",
        life_cycle_version: this.methodCodification(lom?.lifeCycle?.version?.version) || "",
        life_cycle_status: this.methodCodification(lom?.lifeCycle?.status?.value) || "",
        life_cycle_role: this.methodCodification(lom?.lifeCycle?.contribute?.role) || "",
        life_cycle_entity: this.methodCodification(lom?.lifeCycle?.contribute?.entity)|| "",
        life_cycle_dateTime: this.methodCodification(lom?.lifeCycle?.contribute?.dateTime) || "",
        life_cycle_description: this.methodCodification(lom?.lifeCycle?.contribute?.description) || "",
        meta_metadata_catalog: this.methodCodification(lom?.metaMetadata?.identifier?.catalog) || "",
        meta_metadata_entry: this.methodCodification(lom?.metaMetadata?.identifier?.entry) || "",
        meta_metadata_role: this.methodCodification(lom?.metaMetadata?.contribute?.value) || "",
        meta_metadata_entity: this.methodCodification(lom?.metaMetadata?.contribute?.entity) || "",
        meta_metadata_dateTime: this.methodCodification(lom?.metaMetadata?.contribute?.date) || "",
        meta_metadata_description:  lom?.metaMetadata?.contribute?.description.join(", ") || "",
        technical_format: this.methodCodification(lom?.technical?.format.format) || "",
        technical_size: this.methodCodification(lom?.technical?.size.size) || 0,
        technical_location: this.methodCodification(lom?.technical?.location?.location) || "",
        technical_requirement_type: this.methodCodification(lom?.technical?.requirement?.typeValue) || "",
        technical_requirement_name: this.methodCodification(lom?.technical?.requirement?.nameValue) || "",
        technical_requirement_minimumVersion: this.methodCodification(lom?.technical?.requirement?.minVersion) || "",
        technical_installationRremarks: this.methodCodification(lom?.technical?.installationRemarks?.installationRemarks) || "",
        technical_otherPlatformRequirements:this.methodCodification(lom?.technical?.otherPlatformRequirements?.otherPlatformRequirements) || "",
        //Para revision con otros objetos de aprendizaje
        technical_dateTime: lom?.technical?.contribute?.date?.dateTime || "",
        //Para revision con otros objeto de aprendizaje
        technical_description:lom?.technical?.contribute?.date?.description?.string || "",
        educational_interactivityType:this.methodCodification(lom?.educational?.interactivityType?.value)|| "",
        educational_learningResourceType: this.methodCodification(lom?.educational?.learningResourceType?.value) || "",
        educational_interactivityLevel: this.methodCodification(lom?.educational?.interactivityLevel?.value) || "",
        educational_semanticDensity: this.methodCodification(lom?.educational?.semanticDensity?.value) || "",
        educational_intendedEndUserRole: this.methodCodification(lom?.educational?.intendedEndUserRole?.value) || "",
        educational_context: this.methodCodification(lom?.educational?.context?.value) || "",
        educational_typicalAgeRange: this.methodCodification(lom.educational.typicalAgeRange?.typicalAgeRange) || "",
        educational_difficulty: this.methodCodification(lom?.educational?.difficulty?.value) || "",
        educational_typicalLearningTime_dateTime: this.methodCodification(lom?.educational?.typicalLearningTime?.duration)|| "",
        educational_typicalLearningTime_description:lom?.educational?.typicalLearningTime?.description?.join(", ") || "",
        educational_description: this.methodCodification(lom?.educational?.description?.description) || "",
        educational_language: this.methodCodification(lom?.educational?.language?.language) || "",
        //Revisar con otros obejtos de aprendizaje
        educational_procces_cognitve: lom?.educational?.educational_procces_cognitve || "", 
        rights_cost: lom?.rights?.cost?.value || "",
        rights_copyrightAndOtherRestrictions:lom?.rights?.copyrightAndOtherRestrictions?.value || "",
        rights_description: this.methodCodification(lom?.rights?.description) || "",
        relation_kind: this.methodCodification(lom?.relation?.kind?.value) || "",
        relation_catalog: this.methodCodification(lom?.relation?.resource?.catalog) || "",
        relation_entry: this.methodCodification(lom?.relation?.resource?.entry) || "", 
        relation_description:this.methodCodification(lom?.relation?.resource?.description) || "",
        annotation_entity: this.methodCodification(lom?.annotation?.entity?.entity) || "",
        annotation_date_dateTime: this.methodCodification(lom?.annotation?.date?.dateTime) || "",
        annotation_date_description:lom?.annotation?.date?.description.join(", ") || "",
        annotation_description: this.methodCodification(lom?.annotation?.description?.description) || "",
        annotation_modeaccess:  this.methodCodification(lom?.annotation?.accessmode?.value) || "",
        annotation_modeaccesssufficient:  this.methodCodification(lom?.annotation?.accessmodesufficient?.value) || "",
        annotation_rol:  this.methodCodification(lom?.annotation?.rol?.value),
        classification_purpose: this.methodCodification(lom?.classification?.purpose?.value) || "",
        classification_taxonPath_source:  this.methodCodification(lom?.classification?.taxonPath.source) || "",
        classification_taxonPath_taxon: lom?.classification?.taxonPath.entry.join(", ") || "",
        classification_description: this.methodCodification( lom?.classification?.description?.description) || "",
        //verificar con otro obejtos de aprendizaje
        classification_keyword: this.methodCodification(lom?.classification?.keyword?.keyword) || '',
        accesibility_summary: this.methodCodification(lom?.accesibility?.description?.description) || "",
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

  private methodCodification(text){
    let text_ref:string;
    if(text == undefined){
      text_ref = '';
    }else{
      text_ref = text[0];
    }
    return  text_ref;
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
