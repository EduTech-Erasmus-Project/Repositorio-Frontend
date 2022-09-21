import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit {
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
        label: "Introducción",
        routerLink: "introduction",
      },
      {
        label: "Busqueda de objetos de aprendizaje",
        routerLink: "search-public",
      },
      {
        label: "Registrarse con un perfil",
        routerLink: "registration-profile",
      },
    ];

    this.activeIndex = this.items.findIndex(
      (item) => item.routerLink === this.path
    );
  }

  public prevPage() {
    this.activeIndex -= 1;
    this.router.navigate([`/guide/${this.items[this.activeIndex].routerLink}`]);
  }

  public nextPage() {
    this.activeIndex += 1;
    this.router.navigate([`/guide/${this.items[this.activeIndex].routerLink}`]);
  }

  public reset_Page(){
    
  }
}
