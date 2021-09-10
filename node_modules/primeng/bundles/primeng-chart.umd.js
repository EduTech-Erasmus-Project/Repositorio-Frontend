(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@angular/core'),require('@angular/common'),exports, require('@angular/core'), require('@angular/common'), require('chart.js')) :
    typeof define === 'function' && define.amd ? define('primeng/chart', ['@angular/core','@angular/common','exports', '@angular/core', '@angular/common', 'chart.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ng.core,global.ng.common,(global.primeng = global.primeng || {}, global.primeng.chart = {}), global.ng.core, global.ng.common, global.Chart));
}(this, (function (ɵngcc0,ɵngcc1,exports, core, common, Chart) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var Chart__namespace = /*#__PURE__*/_interopNamespace(Chart);

    var UIChart = /** @class */ (function () {
        function UIChart(el) {
            this.el = el;
            this.plugins = [];
            this.responsive = true;
            this.onDataSelect = new core.EventEmitter();
            this._options = {};
        }
        Object.defineProperty(UIChart.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (val) {
                this._data = val;
                this.reinit();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(UIChart.prototype, "options", {
            get: function () {
                return this._options;
            },
            set: function (val) {
                this._options = val;
                this.reinit();
            },
            enumerable: false,
            configurable: true
        });
        UIChart.prototype.ngAfterViewInit = function () {
            this.initChart();
            this.initialized = true;
        };
        UIChart.prototype.onCanvasClick = function (event) {
            if (this.chart) {
                var element = this.chart.getElementAtEvent(event);
                var dataset = this.chart.getDatasetAtEvent(event);
                if (element && element[0] && dataset) {
                    this.onDataSelect.emit({ originalEvent: event, element: element[0], dataset: dataset });
                }
            }
        };
        UIChart.prototype.initChart = function () {
            var opts = this.options || {};
            opts.responsive = this.responsive;
            // allows chart to resize in responsive mode
            if (opts.responsive && (this.height || this.width)) {
                opts.maintainAspectRatio = false;
            }
            this.chart = new Chart__namespace(this.el.nativeElement.children[0].children[0], {
                type: this.type,
                data: this.data,
                options: this.options,
                plugins: this.plugins
            });
        };
        UIChart.prototype.getCanvas = function () {
            return this.el.nativeElement.children[0].children[0];
        };
        UIChart.prototype.getBase64Image = function () {
            return this.chart.toBase64Image();
        };
        UIChart.prototype.generateLegend = function () {
            if (this.chart) {
                return this.chart.generateLegend();
            }
        };
        UIChart.prototype.refresh = function () {
            if (this.chart) {
                this.chart.update();
            }
        };
        UIChart.prototype.reinit = function () {
            if (this.chart) {
                this.chart.destroy();
                this.initChart();
            }
        };
        UIChart.prototype.ngOnDestroy = function () {
            if (this.chart) {
                this.chart.destroy();
                this.initialized = false;
                this.chart = null;
            }
        };
UIChart.ɵfac = function UIChart_Factory(t) { return new (t || UIChart)(ɵngcc0.ɵɵdirectiveInject(ɵngcc0.ElementRef)); };
UIChart.ɵcmp = ɵngcc0.ɵɵdefineComponent({ type: UIChart, selectors: [["p-chart"]], inputs: { plugins: "plugins", responsive: "responsive", data: "data", options: "options", type: "type", width: "width", height: "height" }, outputs: { onDataSelect: "onDataSelect" }, decls: 2, vars: 6, consts: [[2, "position", "relative"], [3, "click"]], template: function UIChart_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵelementStart(0, "div", 0);
        ɵngcc0.ɵɵelementStart(1, "canvas", 1);
        ɵngcc0.ɵɵlistener("click", function UIChart_Template_canvas_click_1_listener($event) { return ctx.onCanvasClick($event); });
        ɵngcc0.ɵɵelementEnd();
        ɵngcc0.ɵɵelementEnd();
    } if (rf & 2) {
        ɵngcc0.ɵɵstyleProp("width", ctx.responsive && !ctx.width ? null : ctx.width)("height", ctx.responsive && !ctx.height ? null : ctx.height);
        ɵngcc0.ɵɵadvance(1);
        ɵngcc0.ɵɵattribute("width", ctx.responsive && !ctx.width ? null : ctx.width)("height", ctx.responsive && !ctx.height ? null : ctx.height);
    } }, encapsulation: 2, changeDetection: 0 });
/*@__PURE__*/ (function () { ɵngcc0.ɵsetClassMetadata(UIChart, [{
        type: core.Component,
        args: [{
                selector: 'p-chart',
                template: "\n        <div style=\"position:relative\" [style.width]=\"responsive && !width ? null : width\" [style.height]=\"responsive && !height ? null : height\">\n            <canvas [attr.width]=\"responsive && !width ? null : width\" [attr.height]=\"responsive && !height ? null : height\" (click)=\"onCanvasClick($event)\"></canvas>\n        </div>\n    ",
                changeDetection: core.ChangeDetectionStrategy.OnPush,
                encapsulation: core.ViewEncapsulation.None
            }]
    }], function () { return [{ type: ɵngcc0.ElementRef }]; }, { plugins: [{
            type: core.Input
        }], responsive: [{
            type: core.Input
        }], onDataSelect: [{
            type: core.Output
        }], data: [{
            type: core.Input
        }], options: [{
            type: core.Input
        }], type: [{
            type: core.Input
        }], width: [{
            type: core.Input
        }], height: [{
            type: core.Input
        }] }); })();
        return UIChart;
    }());
    UIChart.ctorParameters = function () { return [
        { type: core.ElementRef }
    ]; };
    UIChart.propDecorators = {
        type: [{ type: core.Input }],
        plugins: [{ type: core.Input }],
        width: [{ type: core.Input }],
        height: [{ type: core.Input }],
        responsive: [{ type: core.Input }],
        onDataSelect: [{ type: core.Output }],
        data: [{ type: core.Input }],
        options: [{ type: core.Input }]
    };
    var ChartModule = /** @class */ (function () {
        function ChartModule() {
        }
ChartModule.ɵmod = ɵngcc0.ɵɵdefineNgModule({ type: ChartModule });
ChartModule.ɵinj = ɵngcc0.ɵɵdefineInjector({ factory: function ChartModule_Factory(t) { return new (t || ChartModule)(); }, imports: [[common.CommonModule]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && ɵngcc0.ɵɵsetNgModuleScope(ChartModule, { declarations: [UIChart], imports: [ɵngcc1.CommonModule], exports: [UIChart] }); })();
/*@__PURE__*/ (function () { ɵngcc0.ɵsetClassMetadata(ChartModule, [{
        type: core.NgModule,
        args: [{
                imports: [common.CommonModule],
                exports: [UIChart],
                declarations: [UIChart]
            }]
    }], function () { return []; }, null); })();
        return ChartModule;
    }());

    /**
     * Generated bundle index. Do not edit.
     */

    exports.ChartModule = ChartModule;
    exports.UIChart = UIChart;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=primeng-chart.umd.js.map