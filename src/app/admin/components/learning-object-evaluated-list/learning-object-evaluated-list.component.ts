import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LearningObjects } from '../../models/evaluation.models';

@Component({
  selector: 'app-learning-object-evaluated-list',
  templateUrl: './learning-object-evaluated-list.component.html',
  styleUrls: ['./learning-object-evaluated-list.component.css']
})
export class LearningObjectEvaluatedListComponent implements OnInit {
  expertId:number;
  learningobjects:any=[];
  isLoading:boolean = false;
  learningobjectsSelected: LearningObjects[];
  @ViewChild('dt') table: Table;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private router: ActivatedRoute,
    private route: Router
  ) {
    this.expertId = this.router.snapshot.params['id'];
    this.breadcrumbService.setItems([
      { label: 'Docentes y expertos aprobados',routerLink: ['/admin/teacher/request/approved'] },
      { label: 'Objetos de aprendizaje evaluados'}
  ]);
   }

  ngOnInit(): void {
    this.getLearningObjectDetails();
  }
  getLearningObjectDetails(){
    this.administratorService.getLearningObjectEvaluatedByExpert(this.expertId).subscribe((resp:any)=>{
      this.isLoading = true;
      this.learningobjects=resp.results;
    })
  }
  getLearningObjectDetail(slug:string){
    this.route.navigate([`/admin/teacher/request/approved/learning-object/evaluated/${this.expertId}/detail/${slug}`]);
  }
}
