import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import { SharedModule } from "../../../shared/shared.module";
import { DropDownMenuLearningObjectComponent } from '../drop-down-menu-learning-object/drop-down-menu-learning-object.component';

@Component({
    selector: 'app-iframe-integrated-menu',
    templateUrl: './iframe-integrated-menu.component.html',
    styleUrls: ['./iframe-integrated-menu.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, DropDownMenuLearningObjectComponent]
})
export class IframeIntegratedMenuComponent implements OnInit {
  @Input() object: ObjectLearning;
  public buttonMenuBoolean: boolean = false;
 @Input() youNeedMenu: boolean = false;
  constructor() {

  }

  ngOnInit(): void {
    
    (this.object.learning_object_file.url.indexOf('website_index.html') === -1) ? this.youNeedMenu = true : this.youNeedMenu = false;

  }

  public sizeWindowMaxValue() {
    var ancho = window.innerWidth
    if (ancho <= 1300) {
      return '';
    } else {
      if (!this.buttonMenuBoolean && this.youNeedMenu == true) {
        return 'width:75%'
      }else{
        return 'width:100%; height:100%'
      }
    }
  }

}
