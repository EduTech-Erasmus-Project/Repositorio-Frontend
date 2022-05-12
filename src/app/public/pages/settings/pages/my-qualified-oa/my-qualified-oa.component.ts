import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import { LearningObjectService } from 'src/app/services/learning-object.service';
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
    private searchService: SearchService
  ) { }
  
  ngOnDestroy(): void {
   this.suscribes.forEach((result) => result.unsubscribe());
  }

  ngOnInit(): void {
    this.loadData();
  }

  
  async loadData() {
    console.log('Loading');
    let searchSub = await this.searchService
    .search(true)
    .subscribe(
      (res: any) => {
        console.log(res.results)
        //console.log("params", this.querySearchService.queryParams)
        //console.log("results",res)
        this.objects = res.results;
        //this.loading = false;
      },
      (err) => {
        console.log(err);
      }
    );
  this.suscribes.push(searchSub);
  }

}
