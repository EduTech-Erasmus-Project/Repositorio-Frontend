import { Component, Renderer2 } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PrimeNGConfig } from 'primeng/api';
import { MenuService } from '../services/app.menu.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  animations: [
    trigger('mask-anim', [
        state('void', style({
            opacity: 0
        })),
        state('visible', style({
            opacity: 0.8
        })),
        transition('* => *', animate('250ms cubic-bezier(0, 0, 0.2, 1)'))
    ])
]
})
export class AdminComponent {
    rightPanelClick: boolean;

    rightPanelActive: boolean;

    menuClick: boolean;

    staticMenuActive: boolean=true;

    menuMobileActive: boolean;

    megaMenuClick: boolean;

    megaMenuActive: boolean;

    megaMenuMobileClick: boolean;

    megaMenuMobileActive: boolean;

    topbarItemClick: boolean;

    topbarMobileMenuClick: boolean;

    topbarMobileMenuActive: boolean;

    sidebarActive: boolean;

    activeTopbarItem: any;

    topbarMenuActive: boolean;

    menuHoverActive: boolean;

    configActive: boolean;

    configClick: boolean;

    constructor(public renderer: Renderer2, private menuService: MenuService,
                private primengConfig: PrimeNGConfig, public app: AppComponent) {
                this.staticMenuActive=localStorage.getItem('menuActive')==='true'?true:false;
                }

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

    onMegaMenuButtonClick(event) {
        this.megaMenuClick = true;
        this.megaMenuActive = !this.megaMenuActive;
        event.preventDefault();
    }

    onMegaMenuClick(event) {
        this.megaMenuClick = true;
        event.preventDefault();
    }

    onTopbarItemClick(event, item) {
        this.topbarItemClick = true;

        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null; } else {
            this.activeTopbarItem = item; }

        event.preventDefault();
    }

    onRightPanelButtonClick(event) {
        this.rightPanelClick = true;
        this.rightPanelActive = !this.rightPanelActive;

        event.preventDefault();
    }

    onRightPanelClose(event) {
        this.rightPanelActive = false;
        this.rightPanelClick = false;

        event.preventDefault();
    }

    onRightPanelClick(event) {
        this.rightPanelClick = true;

        event.preventDefault();
    }

    onTopbarMobileMenuButtonClick(event) {
        this.topbarMobileMenuClick = true;
        this.topbarMobileMenuActive = !this.topbarMobileMenuActive;

        event.preventDefault();
    }

    onMegaMenuMobileButtonClick(event) {
        this.megaMenuMobileClick = true;
        this.megaMenuMobileActive = !this.megaMenuMobileActive;

        event.preventDefault();
    }

    onMenuButtonClick(event) {
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
        localStorage.setItem('menuActive',this.staticMenuActive.toString());
        event.preventDefault();
    }

    onConfigClick(event) {
        this.configClick = true;
    }

    onRippleChange(event) {
        this.app.ripple = event.checked;
        this.primengConfig = event.checked;
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