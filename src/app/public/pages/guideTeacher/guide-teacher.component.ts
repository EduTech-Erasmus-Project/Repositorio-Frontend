import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-guide-teacher',
  templateUrl: './guide-teacher.component.html',
  styleUrls: ['./guide-teacher.component.scss']
})
export class GuideTeacherComponent implements OnInit {

  public items: MenuItem[];
  //private subscription: Subscription;
  private path: string;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.path = this.route.snapshot.firstChild.url[0].path;
  }

  public activeIndex: number = 0;

  ngOnDestroy(): void {
    //this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    //console.log("GuideComponent", this.activeIndex);
    this.items = [
      {
        label: "Carga de objetos de aprendizaje",
        routerLink: "uploadfile",
      },
      {
        label: "Carga de objetos de aprendizaje adaptados OERADAP",
        routerLink: "uploadfile-adapted",
      },
      {
        label: "Ver mis objetos de aprendizaje",
        routerLink: "my-objects",
      },
    ];

    this.activeIndex = this.items.findIndex(
      (item) => item.routerLink === this.path
    );
  }

  public prevPage() {
    this.activeIndex -= 1;
    this.router.navigate([`/guideTeacher/${this.items[this.activeIndex].routerLink}`]);
  }

  public nextPage() {
    this.activeIndex += 1;
    this.router.navigate([`/guideTeacher/${this.items[this.activeIndex].routerLink}`]);
  }

  public reset_Page(){
    this.router.navigate(['/guide/registration-profile']);
  }
}
