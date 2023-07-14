import { Component, OnInit } from '@angular/core';
import { PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss']
})
export class AboutusComponent implements OnInit {
  public events1: any[];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private languageService : LanguageService
  ) { 
    this.add_breadcrumb();
  }

  ngOnInit(): void {
    this.events1 = [
      {status: 'Ing. Ángel Paqui', date: 'Desarrollo Backend', icon: PrimeIcons.ANGLE_RIGHT, color: '#3B5B68', email:'apaquig@est.ups.edu.ec',email1:'angelpaqui36@gmail.com'},
      {status: 'Ing. Claudio Maldonado', date: 'Desarrollo Frontend', icon: PrimeIcons.ANGLE_LEFT, color: '#3B5B68',email:'cmaldonadom3@est.ups.edu.ec',email1:'claudio.mldo@outlook.com'},
      {status: 'Ing. Edwin Marquez', date: 'Desarrollo Frontend y Backend', icon: PrimeIcons.ANGLE_RIGHT, color: '#3B5B68',email:'emarquezl@est.ups.edu.ec',email1:'edwi1999@hotmail.com'},
      {status: 'Ing. Bryam Chimbo', date: 'Desarrollo Backend y Frontend', icon: PrimeIcons.ANGLE_LEFT, color: '#3B5B68',email:'bchimboa1@est.ups.edu.ec',email1:'bry4mchimbo@gmail.com'},
      {status: 'Ing. Paola Ingavelez', date: 'Docente', icon: PrimeIcons.ANGLE_RIGHT, color: '#3B5B68',email:'pcingavelez@ups.edu.ec',email1:''},
      {status: 'Ing. Ángel Pérez', date: 'Docente', icon: PrimeIcons.ANGLE_LEFT, color: '#3B5B68',email:'aperezm@ups.edu.ec',email1:''}
  ];
  }

  private async add_breadcrumb(){
    this.breadcrumbService.setItems([
      {label: "ROA"},
      { label: await this.languageService.translate.get('menu.aboutUs').toPromise(), routerLink: ["/about-us"] },
    ]);
  }

}
