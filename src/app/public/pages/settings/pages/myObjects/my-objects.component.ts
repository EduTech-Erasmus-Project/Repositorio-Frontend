import { Component, OnInit, OnDestroy } from "@angular/core";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-my-objects",
  templateUrl: "./my-objects.component.html",
  styleUrls: ["./my-objects.component.scss"],
})
export class MyObjectsComponent implements OnInit, OnDestroy {
  public objects: ObjectLearning[];
  private suscribes: Subscription[] = [];

  constructor(
    private learningObjectService: LearningObjectService,
    private breadcrumbService:BreadcrumbService,
    private languageService: LanguageService
    ) {
      this.add_breadcrumb();
    }

  ngOnDestroy(): void {
    this.suscribes.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await this.languageService.translate.get('menu.settings').toPromise()},
      { label: await this.languageService.translate.get('menu.sideMenu.myObjectsA').toPromise(), routerLink: ["/settings/my-objects"] },
    ]);
  }

  async loadData() {
    let objectTeacher = await this.learningObjectService
      .getObjectsTeacher()
      .subscribe(
        (res: any) => {
          this.objects = res.results;
        },
        (err) => {
          this.objects = [];
        }
      );
    this.suscribes.push(objectTeacher);
  }
  public reloadData(evt){
    if(evt){
      this.loadData();
    }
  }
}
