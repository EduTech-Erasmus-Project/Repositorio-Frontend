import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { LearningObjectService } from "../../../services/learning-object.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { LoginService } from "../../../services/login.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-side-object",
  templateUrl: "./side-object.component.html",
  styleUrls: ["./side-object.component.scss"],
})
export class SideObjectComponent implements OnInit, OnDestroy {
  public rating = 3.5;
  public title: string;
  public objects: ObjectLearning[];
  private subscribes: Subscription[] = [];

  constructor(
    private router: Router,
    private learningObjectService: LearningObjectService,
    private loginService: LoginService
  ) {}
  ngOnDestroy(): void {
    this.subscribes.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  onSearch() {
    if (this.title && this.title !== "") {
      let extras: NavigationExtras = {
        queryParams: {
          general_title: this.title,
        },
      };
      this.router.navigate(["/search"], extras);
    }
  }

  async loadData() {
    //console.log("this.loginComponent.user", this.loginComponent.user)
    if (this.studentRole) {
      let recomemensesSub = await this.learningObjectService
        .getRecommendedObjects()
        .subscribe((res: any) => {
          this.objects = res.map((res) => {
            return {
              ...res.learning_object,
              rating: res.rating,
            };
          });
        });
      this.subscribes.push(recomemensesSub);
    } else if (this.expertRole) {
      let noRatedSub = await this.learningObjectService
        .searchExpertNoRated()
        .subscribe(
          (res: any) => {
            //console.log("expert", res);
            this.objects = res.results;
            this.objects = this.objects.map((res: ObjectLearning) => {
              return {
                ...res,
                rating: 0,
              };
            });
          },
          (err) => console.log(err)
        );
      this.subscribes.push(noRatedSub);
    } else {
      let popularsSub = await this.learningObjectService
        .getPopulars()
        .subscribe((res: any) => {
          //console.log("popular", res)
          this.objects = res.map((res) => {
            return {
              ...res.learning_object,
              rating: res.rating,
            };
          });
        });
      this.subscribes.push(popularsSub);
    }
  }

  onClick(slug: string) {
    //console.log("slug", slug)
    this.router.navigate(["/object", slug]);
  }

  get studentRole() {
    return this.loginService.validateRole("student");
  }

  get expertRole() {
    return this.loginService.validateRole("expert");
  }
}
