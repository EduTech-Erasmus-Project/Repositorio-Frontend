import { NgModule, Component, EventEmitter, Input, NgZone, Output, ElementRef, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as ɵngcc0 from '@angular/core';
export class Captcha {
    constructor(el, _zone, cd) {
        this.el = el;
        this._zone = _zone;
        this.cd = cd;
        this.siteKey = null;
        this.theme = 'light';
        this.type = 'image';
        this.size = 'normal';
        this.tabindex = 0;
        this.language = null;
        this.initCallback = "initRecaptcha";
        this.onResponse = new EventEmitter();
        this.onExpire = new EventEmitter();
        this._instance = null;
    }
    ngAfterViewInit() {
        if (window.grecaptcha) {
            if (!window.grecaptcha.render) {
                setTimeout(() => {
                    this.init();
                }, 100);
            }
            else {
                this.init();
            }
        }
        else {
            window[this.initCallback] = () => {
                this.init();
            };
        }
    }
    init() {
        this._instance = window.grecaptcha.render(this.el.nativeElement.children[0], {
            'sitekey': this.siteKey,
            'theme': this.theme,
            'type': this.type,
            'size': this.size,
            'tabindex': this.tabindex,
            'hl': this.language,
            'callback': (response) => { this._zone.run(() => this.recaptchaCallback(response)); },
            'expired-callback': () => { this._zone.run(() => this.recaptchaExpiredCallback()); }
        });
    }
    reset() {
        if (this._instance === null)
            return;
        window.grecaptcha.reset(this._instance);
        this.cd.markForCheck();
    }
    getResponse() {
        if (this._instance === null)
            return null;
        return window.grecaptcha.getResponse(this._instance);
    }
    recaptchaCallback(response) {
        this.onResponse.emit({
            response: response
        });
    }
    recaptchaExpiredCallback() {
        this.onExpire.emit();
    }
    ngOnDestroy() {
        if (this._instance != null) {
            window.grecaptcha.reset(this._instance);
        }
    }
}
Captcha.ɵfac = function Captcha_Factory(t) { return new (t || Captcha)(ɵngcc0.ɵɵdirectiveInject(ɵngcc0.ElementRef), ɵngcc0.ɵɵdirectiveInject(ɵngcc0.NgZone), ɵngcc0.ɵɵdirectiveInject(ɵngcc0.ChangeDetectorRef)); };
Captcha.ɵcmp = ɵngcc0.ɵɵdefineComponent({ type: Captcha, selectors: [["p-captcha"]], inputs: { siteKey: "siteKey", theme: "theme", type: "type", size: "size", tabindex: "tabindex", language: "language", initCallback: "initCallback" }, outputs: { onResponse: "onResponse", onExpire: "onExpire" }, decls: 1, vars: 0, template: function Captcha_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵelement(0, "div");
    } }, encapsulation: 2, changeDetection: 0 });
Captcha.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone },
    { type: ChangeDetectorRef }
];
Captcha.propDecorators = {
    siteKey: [{ type: Input }],
    theme: [{ type: Input }],
    type: [{ type: Input }],
    size: [{ type: Input }],
    tabindex: [{ type: Input }],
    language: [{ type: Input }],
    initCallback: [{ type: Input }],
    onResponse: [{ type: Output }],
    onExpire: [{ type: Output }]
};
/*@__PURE__*/ (function () { ɵngcc0.ɵsetClassMetadata(Captcha, [{
        type: Component,
        args: [{
                selector: 'p-captcha',
                template: `<div></div>`,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None
            }]
    }], function () { return [{ type: ɵngcc0.ElementRef }, { type: ɵngcc0.NgZone }, { type: ɵngcc0.ChangeDetectorRef }]; }, { siteKey: [{
            type: Input
        }], theme: [{
            type: Input
        }], type: [{
            type: Input
        }], size: [{
            type: Input
        }], tabindex: [{
            type: Input
        }], language: [{
            type: Input
        }], initCallback: [{
            type: Input
        }], onResponse: [{
            type: Output
        }], onExpire: [{
            type: Output
        }] }); })();
export class CaptchaModule {
}
CaptchaModule.ɵmod = ɵngcc0.ɵɵdefineNgModule({ type: CaptchaModule });
CaptchaModule.ɵinj = ɵngcc0.ɵɵdefineInjector({ factory: function CaptchaModule_Factory(t) { return new (t || CaptchaModule)(); }, imports: [[CommonModule]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && ɵngcc0.ɵɵsetNgModuleScope(CaptchaModule, { declarations: function () { return [Captcha]; }, imports: function () { return [CommonModule]; }, exports: function () { return [Captcha]; } }); })();
/*@__PURE__*/ (function () { ɵngcc0.ɵsetClassMetadata(CaptchaModule, [{
        type: NgModule,
        args: [{
                imports: [CommonModule],
                exports: [Captcha],
                declarations: [Captcha]
            }]
    }], null, null); })();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdGNoYS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL2NhcHRjaGEvY2FwdGNoYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFlLFNBQVMsRUFBQyxZQUFZLEVBQUMsS0FBSyxFQUFDLE1BQU0sRUFBVyxNQUFNLEVBQUMsVUFBVSxFQUFDLHVCQUF1QixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25MLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7QUFRN0MsTUFBTSxPQUFPLE9BQU87QUFBRyxJQXNCbkIsWUFBbUIsRUFBYyxFQUFTLEtBQWEsRUFBUyxFQUFxQjtBQUFJLFFBQXRFLE9BQUUsR0FBRixFQUFFLENBQVk7QUFBQyxRQUFRLFVBQUssR0FBTCxLQUFLLENBQVE7QUFBQyxRQUFRLE9BQUUsR0FBRixFQUFFLENBQW1CO0FBQUMsUUFwQjdFLFlBQU8sR0FBVyxJQUFJLENBQUM7QUFDcEMsUUFDYSxVQUFLLEdBQUcsT0FBTyxDQUFDO0FBQzdCLFFBQ2EsU0FBSSxHQUFHLE9BQU8sQ0FBQztBQUM1QixRQUNhLFNBQUksR0FBRyxRQUFRLENBQUM7QUFDN0IsUUFDYSxhQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLFFBQ2EsYUFBUSxHQUFXLElBQUksQ0FBQztBQUNyQyxRQUNhLGlCQUFZLEdBQUcsZUFBZSxDQUFDO0FBQzVDLFFBQ2MsZUFBVSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0FBQ2pFLFFBQ2MsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0FBQy9ELFFBQ1ksY0FBUyxHQUFRLElBQUksQ0FBQztBQUNsQyxJQUM0RixDQUFDO0FBQzdGLElBQ0ksZUFBZTtBQUNuQixRQUFRLElBQVUsTUFBTyxDQUFDLFVBQVUsRUFBRTtBQUN0QyxZQUFZLElBQUksQ0FBTyxNQUFPLENBQUMsVUFBVSxDQUFDLE1B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LGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO0dBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLGNBQ3hDOztpREFDSTtBQUFDO0FBQWlDLFlBVDZDLFVBQVU7QUFBSSxZQUF0QyxNQUFNO0FBQUksWUFBcUUsaUJBQWlCO0FBQUc7QUFBRztBQUN6SixzQkFVSixLQUFLO0FBQUssb0JBRVYsS0FBSztBQUFLLG1CQUVWLEtBQUs7QUFBSyxtQkFFVixLQUFLO0FBQUssdUJBRVYsS0FBSztBQUFLLHVCQUVWLEtBQUs7QUFBSywyQkFFVixLQUFLO0FBQUsseUJBRVYsTUFBTTtBQUFLLHVCQUVYLE1BQU07QUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQUFFO0FBMEVqQixNQUFNLE9BQU8sYUFBYTtBQUFHO3lDQUw1QixRQUFRLFNBQUM7S0FDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsa0JBQ3ZCLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFDbEIsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQzFCOzs7Ozs7Ozs7MEJBQ0k7QUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQWZ0ZXJWaWV3SW5pdCxDb21wb25lbnQsRXZlbnRFbWl0dGVyLElucHV0LE5nWm9uZSxPbkRlc3Ryb3ksT3V0cHV0LEVsZW1lbnRSZWYsQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIFZpZXdFbmNhcHN1bGF0aW9uLCBDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdwLWNhcHRjaGEnLFxuICAgIHRlbXBsYXRlOiBgPGRpdj48L2Rpdj5gLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQ2FwdGNoYSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsT25EZXN0cm95IHtcblxuICAgIEBJbnB1dCgpIHNpdGVLZXk6IHN0cmluZyA9IG51bGw7XG4gICAgICAgIFxuICAgIEBJbnB1dCgpIHRoZW1lID0gJ2xpZ2h0JztcbiAgICBcbiAgICBASW5wdXQoKSB0eXBlID0gJ2ltYWdlJztcbiAgICBcbiAgICBASW5wdXQoKSBzaXplID0gJ25vcm1hbCc7XG4gICAgXG4gICAgQElucHV0KCkgdGFiaW5kZXggPSAwO1xuICAgIFxuICAgIEBJbnB1dCgpIGxhbmd1YWdlOiBzdHJpbmcgPSBudWxsO1xuICAgICBcbiAgICBASW5wdXQoKSBpbml0Q2FsbGJhY2sgPSBcImluaXRSZWNhcHRjaGFcIjtcbiAgICBcbiAgICBAT3V0cHV0KCkgb25SZXNwb25zZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgXG4gICAgQE91dHB1dCgpIG9uRXhwaXJlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBcbiAgICBwcml2YXRlIF9pbnN0YW5jZTogYW55ID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZiwgcHVibGljIF96b25lOiBOZ1pvbmUsIHB1YmxpYyBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHt9XG4gICAgXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBpZiAoKDxhbnk+d2luZG93KS5ncmVjYXB0Y2hhKSB7XG4gICAgICAgICAgICBpZiAoISg8YW55PndpbmRvdykuZ3JlY2FwdGNoYS5yZW5kZXIpe1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT57XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICAgICAgICAgIH0sMTAwKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAoPGFueT53aW5kb3cpW3RoaXMuaW5pdENhbGxiYWNrXSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gXG4gICAgfVxuICAgIFxuICAgIGluaXQoKcKge1xuICAgICAgICB0aGlzLl9pbnN0YW5jZSA9ICg8YW55PndpbmRvdykuZ3JlY2FwdGNoYS5yZW5kZXIodGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdLCB7XG4gICAgICAgICAgICAnc2l0ZWtleSc6IHRoaXMuc2l0ZUtleSxcbiAgICAgICAgICAgICd0aGVtZSc6IHRoaXMudGhlbWUsXG4gICAgICAgICAgICAndHlwZSc6IHRoaXMudHlwZSxcbiAgICAgICAgICAgICdzaXplJzogdGhpcy5zaXplLFxuICAgICAgICAgICAgJ3RhYmluZGV4JzogdGhpcy50YWJpbmRleCxcbiAgICAgICAgICAgICdobCc6IHRoaXMubGFuZ3VhZ2UsXG4gICAgICAgICAgICAnY2FsbGJhY2snOiAocmVzcG9uc2U6IHN0cmluZykgPT4ge3RoaXMuX3pvbmUucnVuKCgpID0+IHRoaXMucmVjYXB0Y2hhQ2FsbGJhY2socmVzcG9uc2UpKX0sXG4gICAgICAgICAgICAnZXhwaXJlZC1jYWxsYmFjayc6ICgpID0+IHt0aGlzLl96b25lLnJ1bigoKSA9PiB0aGlzLnJlY2FwdGNoYUV4cGlyZWRDYWxsYmFjaygpKX1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHJlc2V0KCkge1xuICAgICAgICBpZiAodGhpcy5faW5zdGFuY2UgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICAoPGFueT53aW5kb3cpLmdyZWNhcHRjaGEucmVzZXQodGhpcy5faW5zdGFuY2UpO1xuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgICBcbiAgICBnZXRSZXNwb25zZSgpOiBTdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5faW5zdGFuY2UgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAoPGFueT53aW5kb3cpLmdyZWNhcHRjaGEuZ2V0UmVzcG9uc2UodGhpcy5faW5zdGFuY2UpO1xuICAgIH1cbiAgICBcbiAgICByZWNhcHRjaGFDYWxsYmFjayhyZXNwb25zZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMub25SZXNwb25zZS5lbWl0KHtcbiAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZWNhcHRjaGFFeHBpcmVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMub25FeHBpcmUuZW1pdCgpO1xuICAgIH1cbiAgICBcbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2luc3RhbmNlICE9IG51bGwpIHtcbiAgICAgICAgICAoPGFueT53aW5kb3cpLmdyZWNhcHRjaGEucmVzZXQodGhpcy5faW5zdGFuY2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxuICAgIGV4cG9ydHM6IFtDYXB0Y2hhXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtDYXB0Y2hhXVxufSlcbmV4cG9ydCBjbGFzcyBDYXB0Y2hhTW9kdWxlIHsgfVxuIl19