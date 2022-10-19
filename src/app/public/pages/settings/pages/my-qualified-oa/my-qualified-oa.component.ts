import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import { LearningObjectService } from 'src/app/services/learning-object.service';
import { LoginService } from 'src/app/services/login.service';
import { QuerySearchService } from 'src/app/services/query-search.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-my-qualified-oa',
  templateUrl: './my-qualified-oa.component.html',
  styleUrls: ['./my-qualified-oa.component.scss']
})
export class MyQualifiedOaComponent implements OnInit, OnDestroy {

  public objects: ObjectLearning[];
  private suscribes: Subscription[] = [];

  constructor(
    private searchService: SearchService,
    private loginService: LoginService,
    public querySearchService: QuerySearchService,
    private learningObjectService: LearningObjectService
  ) { }

  ngOnDestroy(): void {
    this.suscribes.forEach((result) => result.unsubscribe());
  }

  ngOnInit(): void {
    this.loadData();
  }


  async loadData() {

    if (this.roleStudent) {
      let searchSub = await this.learningObjectService.getMyObjectQualifications().subscribe(
        (res: any) => {
          this.objects = res.results;
        },
        (err) => {
          console.log(err);
        }
      );

      this.suscribes.push(searchSub);
    } else if (this.roleExpert) {

      this.querySearchService.queryParams.is_evaluated = "True";

      let searchExpertSub = await this.searchService
        .searchExpert(this.querySearchService.queryParams)
        .subscribe(
          (res: any) => {
            this.objects = res.results;
          },
          (err) => console.log(err)
        );

      this.suscribes.push(searchExpertSub);
    }

  }

  get roleStudent() {
    return this.loginService.validateRole("student");
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  get roleTeacher() {
    return this.loginService.validateRole("teacher");
  }


}