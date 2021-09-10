import { Component, OnInit, OnDestroy } from "@angular/core";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { ObjectLearning } from "../../../../../core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";

@Component({
  selector: "app-my-objects",
  templateUrl: "./my-objects.component.html",
  styleUrls: ["./my-objects.component.scss"],
})
export class MyObjectsComponent implements OnInit, OnDestroy {
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
    let objectTeacher = await this.learningObjectService
      .getObjectsTeacher()
      .subscribe(
        (res: any) => {
          this.objects = res.results;
          //console.log("teacher res", res)
        },
        (err) => {
          this.objects = [];
        }
      );
    this.suscribes.push(objectTeacher);
  }
}
