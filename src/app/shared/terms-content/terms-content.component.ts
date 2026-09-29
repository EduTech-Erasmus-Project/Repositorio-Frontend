import { Component, Input } from "@angular/core";

@Component({
  selector: "app-terms-content",
  templateUrl: "./terms-content.component.html",
  styleUrls: ["./terms-content.component.scss"],
  standalone: false,
})
export class TermsContentComponent {
  @Input() compact = false;
}
