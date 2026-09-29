import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-registration-profile',
    templateUrl: './registration-profile.component.html',
    styleUrls: ['./registration-profile.component.scss'],
    standalone: false
})
export class RegistrationProfileComponent implements OnInit {
  constructor(
    public router: Router
  ) {}

  ngOnInit(): void {
  }

  public navigateTo(path: string): void {
    void this.router.navigate([path]);
  }
}
