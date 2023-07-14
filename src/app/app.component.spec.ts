import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { BreadcrumbService } from './services/breadcrumb.service';

describe('AppComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, ScrollPanelModule, CalendarModule, TabViewModule, CheckboxModule],
            declarations: [
                AppComponent,
            ],
            providers: [BreadcrumbService]
        });
        TestBed.compileComponents();
    });

    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
