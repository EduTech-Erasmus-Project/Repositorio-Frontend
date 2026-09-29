import { Component, OnInit, Renderer2 } from "@angular/core";
import { MenuService } from "../services/app.menu.service";
import { PrimeNG } from "primeng/config";
import { AppComponent } from "../app.component";

@Component({
    selector: "app-public",
    templateUrl: "./public.component.html",
    styleUrls: ["./public.component.scss"],
    standalone: false
})
export class PublicComponent implements OnInit {
  rightPanelClick: boolean;
  rightPanelActive: boolean;
  menuClick: boolean;
  staticMenuActive: boolean = true;
  menuMobileActive: boolean;
  megaMenuClick: boolean;
  megaMenuActive: boolean;
  megaMenuMobileClick: boolean;
  megaMenuMobileActive: boolean;
  topbarItemClick: boolean;
  topbarMobileMenuClick: boolean;
  topbarMobileMenuActive: boolean;
  sidebarActive: boolean;
  activeTopbarItem: unknown | null;
  topbarMenuActive: boolean;
  menuHoverActive: boolean;
  configActive: boolean;
  configClick: boolean;

  constructor(
    public renderer: Renderer2,
    private menuService: MenuService,
    private primengConfig: PrimeNG,
    public app: AppComponent
  ) {
    this.staticMenuActive =
      localStorage.getItem("menuActive") === "true" ? true : false;
  }
  ngOnInit(): void {}

  onLayoutClick() {
    if (!this.topbarItemClick) {
      this.activeTopbarItem = null;
      this.topbarMenuActive = false;
    }

    if (!this.rightPanelClick) {
      this.rightPanelActive = false;
    }

    if (!this.megaMenuClick) {
      this.megaMenuActive = false;
    }

    if (!this.megaMenuMobileClick) {
      this.megaMenuMobileActive = false;
    }

    if (!this.menuClick) {
      if (this.isHorizontal()) {
        this.menuService.reset();
      }

      if (this.menuMobileActive) {
        this.menuMobileActive = false;
      }

      this.menuHoverActive = false;
    }

    if (this.configActive && !this.configClick) {
      this.configActive = false;
    }

    this.configClick = false;
    this.menuClick = false;
    this.topbarItemClick = false;
    this.megaMenuClick = false;
    this.megaMenuMobileClick = false;
    this.rightPanelClick = false;
  }

  onMegaMenuButtonClick(event: Event) {
    this.megaMenuClick = true;
    this.megaMenuActive = !this.megaMenuActive;
    event.preventDefault();
  }

  onMegaMenuClick(event: Event) {
    this.megaMenuClick = true;
    event.preventDefault();
  }

  onTopbarItemClick(event: Event, item: unknown) {
    this.topbarItemClick = true;

    if (this.activeTopbarItem === item) {
      this.activeTopbarItem = null;
    } else {
      this.activeTopbarItem = item;
    }

    event.preventDefault();
  }

  onRightPanelButtonClick(event: Event) {
    this.rightPanelClick = true;
    this.rightPanelActive = !this.rightPanelActive;

    event.preventDefault();
  }

  onRightPanelClose(event: Event) {
    this.rightPanelActive = false;
    this.rightPanelClick = false;

    event.preventDefault();
  }

  onRightPanelClick(event: Event) {
    this.rightPanelClick = true;

    event.preventDefault();
  }

  onTopbarMobileMenuButtonClick(event: Event) {
    this.topbarMobileMenuClick = true;
    this.topbarMobileMenuActive = !this.topbarMobileMenuActive;

    event.preventDefault();
  }

  onMegaMenuMobileButtonClick(event: Event) {
    this.megaMenuMobileClick = true;
    this.megaMenuMobileActive = !this.megaMenuMobileActive;

    event.preventDefault();
  }

  onMenuButtonClick(event: Event) {
    this.menuClick = true;
    this.topbarMenuActive = false;

    if (this.isMobile()) {
      this.menuMobileActive = !this.menuMobileActive;
    }

    event.preventDefault();
  }

  onSidebarClick(event: Event) {
    this.menuClick = true;
  }

  onToggleMenuClick(event: Event) {
    this.staticMenuActive = !this.staticMenuActive;
    localStorage.setItem("menuActive", this.staticMenuActive.toString());
    event.preventDefault();
  }

  onConfigClick(event: Event) {
    this.configClick = true;
  }

  onRippleChange(event: { checked: boolean }) {
    this.app.ripple = event.checked;
    this.primengConfig.ripple.set(event.checked);
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isMobile() {
    return window.innerWidth <= 991;
  }

  isHorizontal() {
    return this.app.horizontalMenu === true;
  }
}
