import { Component, OnInit, OnDestroy } from "@angular/core";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";
import { LearningObjectService } from "../../../../../services/learning-object.service";

@Component({
  selector: "app-student-viewed",
  templateUrl: "./student-viewed.component.html",
  styleUrls: ["./student-viewed.component.scss"],
})
export class StudentViewedComponent implements OnInit, OnDestroy {
  public objects: ObjectLearning[];
  private suscribes: Subscription[] = [];

  constructor(private learningObjectService: LearningObjectService) {}
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
        // console.log("res view", this.objects)
      });

    this.suscribes.push(viewedSub);
  }
}
