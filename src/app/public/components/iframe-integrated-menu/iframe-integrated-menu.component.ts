
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import { shouldDisplayLearningObjectMenu } from 'src/app/core/utils/learning-object-preview';
import { SharedModule } from "../../../shared/shared.module";
import { DropDownMenuLearningObjectComponent } from '../drop-down-menu-learning-object/drop-down-menu-learning-object.component';

@Component({
    selector: 'app-iframe-integrated-menu',
    templateUrl: './iframe-integrated-menu.component.html',
    styleUrls: ['./iframe-integrated-menu.component.scss'],
    imports: [SharedModule, DropDownMenuLearningObjectComponent]
})
export class IframeIntegratedMenuComponent implements OnInit, OnChanges {
  @Input() object: ObjectLearning;
  public buttonMenuBoolean: boolean = false;
  @Input() youNeedMenu: boolean = false;
  @Input() fullscreenMode: boolean = false;

  ngOnInit(): void {
    this.syncPreviewState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['object'] || changes['youNeedMenu']) {
      this.syncPreviewState();
    }
  }

  private syncPreviewState() {
    this.youNeedMenu = shouldDisplayLearningObjectMenu(this.object);
  }

  public get iframeSource() {
    return this.object?.learning_object_file?.url || this.buildPreviewUrl();
  }

  private buildPreviewUrl() {
    const baseUrl = this.object?.preview?.base_url;
    const entrypoint = this.object?.preview?.entrypoint;

    if (!baseUrl || !entrypoint) {
      return '';
    }

    return new URL(entrypoint, baseUrl).toString();
  }

}
