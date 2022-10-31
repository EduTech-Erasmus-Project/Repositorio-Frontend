import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { LearningObjectService } from "../../../services/learning-object.service";

@Component({
  selector: "app-recommended",
  templateUrl: "./recommended.component.html",
  styleUrls: ["./recommended.component.scss"],
})
export class RecommendedComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public recommended: ObjectLearning[];
  public populars: ObjectLearning[];
  public loading: boolean = false;

  constructor(private objectService: LearningObjectService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
    ) {
      this.add_breadcrumb();
    }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      {label: "ROA"},
      { label: await this.languageService.translate.get('menu.recommended').toPromise(), routerLink: ["/guide"] },
    ]);
  }


  async loadData() {
    this.loading = true;
    let recomendadesSub = await this.objectService
      .getRecommendedObjects()
      .subscribe((res: any) => {
        //console.log("rec", res);
        this.recommended = res.map((res) => {
          return {
            ...res.learning_object,
            rating: res.rating,
          };
        });

        this.loading = false;
      });

    let popularsSub = await this.objectService
      .getPopulars()
      .subscribe((res: any) => {
        //console.log("popu", res.results);
        this.populars = res.map((res) => {
          return {
            ...res.learning_object,
            rating: res.rating,
          };
        });
        this.loading = false;
      });

    this.subscriptions.push(recomendadesSub, popularsSub);
  }
}
