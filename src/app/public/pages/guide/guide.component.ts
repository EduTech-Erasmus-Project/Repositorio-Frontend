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
        label: "Cargar archivo",
        routerLink: "upload",
      },
      {
        label: "Área de trabajo",
        routerLink: "tour",
      },
      {
        label: "Audios",
        routerLink: "audio",
      },
      {
        label: "Imagénes",
        routerLink: "image",
      },
      {
        label: "Párrafos",
        routerLink: "paragraph",
      },
      {
        label: "Videos",
        routerLink: "video",
      },
      {
        label: "Descargar",
        routerLink: "download",
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

}
