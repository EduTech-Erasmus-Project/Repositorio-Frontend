import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'app-learning-object-evaluated-detail',
  templateUrl: './learning-object-evaluated-detail.component.html',
  styleUrls: ['./learning-object-evaluated-detail.component.css']
})
export class LearningObjectEvaluatedDetailComponent implements OnInit {
  oaId:number;
  expertId:number=0;
  slug:string="";
  oaDetail:any={};
  oa:any={};
  index_url:string="";
  readMore:boolean = true;
  showEvaluation:boolean = true;
  disableEvaluation:boolean = false;
  conceptEvaluations:any = [];
  @ViewChild('dt') table: Table;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private router: ActivatedRoute
  ) {
    // this.oaId = this.router.snapshot.params['oaId'];
    this.expertId = this.router.snapshot.params['expertId'];
    this.slug = this.router.snapshot.params['slug'];
   }

  ngOnInit(): void {
    if(typeof this.expertId === 'undefined'){
      this.getLearningObjectDetail();
      this.disableEvaluation=false;
    }else{
      this.disableEvaluation=true;
      this.getLearningObjectDetails();
    }
  }

  getLearningObjectDetails(){
    this.administratorService.getLearningObjectEvaluatedByExpert(this.expertId).subscribe((resp:any)=>{
      for (let oa of resp.results){
        if(oa.learning_object.slug === this.slug){
          this.oa = oa;
          this.oaDetail=oa.learning_object;
          this.conceptEvaluations = oa.concept_evaluations;
          this.index_url = this.oaDetail.learning_object_file.url; 
        }
      }
    })
  }
  getLearningObjectDetail() {
    this.administratorService.getLearningObject(this.slug).subscribe((resp:any)=>{
        this.oaDetail=resp;
        this.index_url = this.oaDetail.learning_object_file.url; 
    })
}
  onClick(){
    this.readMore = !this.readMore;
  }
  onClick1(){
    this.showEvaluation = !this.showEvaluation;
  }

}
