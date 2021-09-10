import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { AdministratorService } from 'src/app/services/administrator.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private subscribes: Subscription[] = [];
  public total_oa_approved: number;
  public total_oa_disapproved: number;
  public total_expert_approved: number;
  public total_expert_disapproved: number;
  public total_teacher_approved: number;
  public total_teacher_disapproved: number;
  public total_student: number;
  isLoading:boolean = false;
  constructor(
      private breadcrumbService: BreadcrumbService,
      private administratorService: AdministratorService,
      private router: Router
      ) {
    this.breadcrumbService.setItems([
        {label: 'Home'}
    ]); }

  ngOnInit() {
      this.loadAdminData();
  }
  async loadAdminData(){    
    let toatal_oa = await this.administratorService.getTotalLearningObjectApprovedAndDisapproved().subscribe((res:any) => {
        this.isLoading = true;
        this.total_oa_approved = res.total_oa_aproved?res.total_oa_aproved:0;
        this.total_oa_disapproved = res.toatal_oa_disapproved?res.toatal_oa_disapproved:0;
      });   
    let toatal_teacher_expert = await this.administratorService.getTotalTeacherAndExpert().subscribe((res:any) => {
        this.total_expert_approved = res.total_expert_approved?res.total_expert_approved:0;
        this.total_expert_disapproved = res.total_expert_disapproved?res.total_expert_disapproved:0;
        this.total_teacher_approved = res.total_teacher_approved?res.total_teacher_approved:0;
        this.total_teacher_disapproved = res.total_teacher_disapproved?res.total_teacher_disapproved:0;
        this.total_student = res.total_student?res.total_student:0;
      });   
      this.subscribes.push(toatal_oa,toatal_teacher_expert);
  }
  learningObjectToAprove(id:number){
    switch (id) {
        case 1:
            this.router.navigate(['/admin/learning-object/pending']);
            break;
        case 2:
            this.router.navigate(['/admin/learning-object/approved']);
            break;
        case 3:
            this.router.navigate(['/admin/teacher/request/pending']);
            break;
        case 4:
            this.router.navigate(['/admin/teacher/request/approved']);
            break;
        case 5:
            this.router.navigate(['/admin/student/']);
            break;
        default:
            break;
    }
  }
}
