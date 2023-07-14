import { Component, Input, OnInit } from "@angular/core";
import { ObjectLearning } from "../../core/interfaces/ObjectLearning";

@Component({
  selector: "app-metadata",
  templateUrl: "./metadata.component.html",
  styleUrls: ["./metadata.component.scss"],
})
export class MetadataComponent implements OnInit {
  @Input() learningobjectdetail: ObjectLearning;

  constructor() {}

  ngOnInit(): void {}
}
