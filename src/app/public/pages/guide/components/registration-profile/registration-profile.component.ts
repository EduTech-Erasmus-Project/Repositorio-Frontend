import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-registration-profile',
  templateUrl: './registration-profile.component.html',
  styleUrls: ['./registration-profile.component.scss']
})
export class RegistrationProfileComponent implements OnInit {
  events1: any[];
  constructor(
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.events1 = [
      {status: 'Registro', date:1, icon: PrimeIcons.SHOPPING_CART, color: '#9C27B0', image: 'game-controller.jpg'},
      {status: 'Perfil estudiante', date: 2, icon: PrimeIcons.COG, color: '#673AB7'},
      {status: 'Perfil docente', date: 3, icon: PrimeIcons.ENVELOPE, color: '#FF9800'},
      {status: 'Perfil experto colaborador', date: 4, icon: PrimeIcons.CHECK, color: '#607D8B'}
  ];

  }

}
