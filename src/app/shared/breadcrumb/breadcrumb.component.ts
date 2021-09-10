import { Component, OnDestroy } from "@angular/core";
import { BreadcrumbService } from "../../services/breadcrumb.service";
import { Subscription } from "rxjs";
import { MenuItem } from "primeng/api";

@Component({
  selector: "app-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.css"],
})
export class BreadcrumbComponent implements OnDestroy {
  subscription: Subscription;

  items: MenuItem[];

  constructor(public breadcrumbService: BreadcrumbService) {
    this.subscription = breadcrumbService.itemsHandler.subscribe((response) => {
      this.items = response;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
