import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-view-evaluacions",
  templateUrl: "./view-evaluacions.component.html",
  styleUrls: ["./view-evaluacions.component.css"],
})
export class ViewEvaluacionsComponent implements OnInit {
  @Input() resultsEv: any[];
  @Input() roleExpert: boolean;
  constructor() {}

  ngOnInit(): void {}
}
