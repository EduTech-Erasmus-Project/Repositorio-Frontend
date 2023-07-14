import { Component, OnInit, OnDestroy } from "@angular/core";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";

@Component({
  selector: "app-student-viewed",
  templateUrl: "./student-viewed.component.html",
  styleUrls: ["./student-viewed.component.scss"],
})
export class StudentViewedComponent implements OnInit, OnDestroy {
  public objects: ObjectLearning[];
  private suscribes: Subscription[] = [];

  constructor(private learningObjectService: LearningObjectService,
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

  async loadData() {
    let viewedSub = await this.learningObjectService
      .getObjectsViewed()
      .subscribe((res: any) => {
        this.objects = res.results.map((res) => {
          return {
            ...res.learning_object,
            rating: res.rating,
          };
        });
      });

    this.suscribes.push(viewedSub);
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await this.languageService.translate.get('menu.settings').toPromise()},
      { label: await this.languageService.translate.get('recommended.viewed').toPromise(), routerLink: ["/settings/my-views"] },
    ]);
  }

}
