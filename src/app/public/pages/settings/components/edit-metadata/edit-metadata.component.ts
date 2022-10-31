import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { FormBuilder, FormGroup } from "@angular/forms";
import { LearningObjectService } from '../../../../../services/learning-object.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: "app-edit-metadata",
  templateUrl: "./edit-metadata.component.html",
  styleUrls: ["./edit-metadata.component.scss"],
})
export class EditMetadataComponent implements OnInit, OnDestroy {
  @Input() object: ObjectLearning;
  @Output() clouceEvent = new EventEmitter<boolean>();
  @Output() updateEvent = new EventEmitter<boolean>();

  public metadataForm: FormGroup;
  private subscribes: Subscription[] = [];

  constructor(private fb: FormBuilder,  
    private objectService: 
    LearningObjectService, 
    private messageService: MessageService,
    private languageService: LanguageService
    ) {}

  ngOnInit(): void {
    //console.log(this.object);
    this.loadForm();
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((item) => {
      item.unsubscribe();
    });
  }

  loadForm() {
    this.metadataForm = this.fb.group({
      general_catalog: [this.object.general_catalog || null],
      general_coverage: [this.object.general_coverage || null],
      general_entry: [this.object.general_entry || null],
      general_keyword: [this.object.general_keyword || null],
      general_language: [this.object.general_language || null],
      general_structure: [this.object.general_structure || null],
      life_cycle_role: [this.object.life_cycle_role || null],
      life_cycle_version: [this.object.life_cycle_version || null],
      meta_metadata_catalog: [this.object.meta_metadata_catalog || null],
      meta_metadata_description: [
        this.object.meta_metadata_description || null,
      ],
      meta_metadata_dateTime: [this.object.meta_metadata_dateTime || null],
      technical_description: [this.object.technical_description || null],
      technical_format: [this.object.technical_format || null],
      technical_installationRremarks: [
        this.object.technical_installationRremarks || null,
      ],
      technical_location: [this.object.technical_location || null],
      educational_description: [this.object.educational_description || null],
      educational_difficulty: [this.object.educational_difficulty || null],
      educational_language: [this.object.educational_language || null],
      educational_learningResourceType: [
        this.object.educational_learningResourceType || null,
      ],
      educational_procces_cognitve: [
        this.object.educational_procces_cognitve || null,
      ],
      educational_typicalLearningTime_description: [
        this.object.educational_typicalLearningTime_description || null,
      ],
      rights_copyrightAndOtherRestrictions: [
        this.object.rights_copyrightAndOtherRestrictions || null,
      ],
      annotation_date_description: [
        this.object.annotation_date_description || null,
      ],
      annotation_date_dateTime: [this.object.annotation_date_dateTime || null],
      annotation_description: [this.object.annotation_description || null],
      annotation_entity: [this.object.annotation_entity || null],
      annotation_modeaccess: [this.object.annotation_modeaccess || null],
      annotation_modeaccesssufficient: [
        this.object.annotation_modeaccesssufficient || null,
      ],
      relation_catalog: [this.object.relation_catalog || null],
      relation_description: [this.object.relation_description || null],
      relation_kind: [this.object.relation_kind || null],
      relation_entry: [this.object.relation_entry || null],
      classification_description: [
        this.object.classification_description || null,
      ],
      classification_keyword: [this.object.classification_keyword || null],
      classification_purpose: [this.object.classification_purpose || null],
      classification_taxonPath_source: [
        this.object.classification_taxonPath_source || null,
      ],
      classification_taxonPath_taxon: [
        this.object.classification_taxonPath_taxon || null,
      ],
      accesibility_summary: [this.object.accesibility_summary || null],
      accesibility_features: [this.object.accesibility_features || null],
      accesibility_hazard: [this.object.accesibility_hazard || null],
      accesibility_control: [this.object.accesibility_control || null],
      accesibility_api: [this.object.accesibility_api || null],
      rights_cost: [this.object.rights_cost || null],
      annotation_rol: [this.object.annotation_rol || null],
    });
  }

  async onEditmetadata() {
    //console.log(this.metadataForm.value)
    let data =  this.metadataForm.value;
    data.id = this.object.id;
    let addMetadataSub = await this.objectService
        .editMetadata(data)
        .subscribe(
          async (res: any) => {

            //console.log(res)
            this.updateEvent.emit(true);

            this.messageService.add({
              severity: "success",
              summary: await this.languageService.translate.get('newObject.form.success').toPromise(),
              detail: await this.languageService.translate.get('object.messageSuccess').toPromise(),
            });
            //return this.router.navigateByUrl("/settings/my-objects");
          },
          async (err) => {
            this.messageService.add({
              severity: "error",
              summary: await this.languageService.translate.get('newObject.form.alert').toPromise(),
              detail:
                await this.languageService.translate.get('object.messageError').toPromise(),
            });

          }
        );
      this.subscribes.push(addMetadataSub);
  }

  onClouceWindow() {
    this.clouceEvent.emit(false);
  }
}
