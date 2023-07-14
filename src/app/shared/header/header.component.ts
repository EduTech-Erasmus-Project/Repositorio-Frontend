import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
 @Input() header_title:string;
 @Input() header_height:number = 17;
 @Input() header_text_size:number = 18;
  constructor(){

  }
  ngOnInit(): void {
    //throw new Error('Method not implemented.');
  }
}
