import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { SharedModule } from "../../../shared/shared.module";
import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningObjectService } from 'src/app/services/learning-object.service';
import { Subscription } from 'rxjs';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { DropDownMenuLearningObjectComponent } from '../../components/drop-down-menu-learning-object/drop-down-menu-learning-object.component';
import { IframeIntegratedMenuComponent } from "../../components/iframe-integrated-menu/iframe-integrated-menu.component";
@Component({
    selector: 'app-previewing-learning-object',
    templateUrl: './previewing-learning-object.component.html',
    styleUrls: ['./previewing-learning-object.component.scss'],
    standalone: true,
    imports: [SharedModule, ProgressSpinnerModule, DropDownMenuLearningObjectComponent, IframeIntegratedMenuComponent]
})
export class PreviewingLearningObjectComponent implements OnInit, OnDestroy{
  
  
  public buttonMenuBoolean: boolean = false;
  public youNeedMenu: boolean = true;
  public object : ObjectLearning;
  private slug: string;
  private unsubscription: Subscription[] = [];
  public spinnerFlag : boolean = false;
  constructor(
    private route : ActivatedRoute,
    private objectService : LearningObjectService,
    private router: Router
  ){
    this.route.params.subscribe((params) => {
      if(params.slug){
        this.slug =  params.slug;
        this.loadDataLearningObject();
      }else{
        this.router.navigate(['/'])
      }
  });
  }
  
  ngOnDestroy(): void {
   this.unsubscription.forEach(res=> res.unsubscribe())
  }

  ngOnInit(): void {
   
  }

  private async loadDataLearningObject(){
    let detailSub = await this.objectService.getObjectDetail(this.slug).subscribe(
      (res: any) => {   
        if(res){
            this.object = res;
            this.spinnerFlag = true;
        }
      });
      this.unsubscription.push(detailSub);
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
