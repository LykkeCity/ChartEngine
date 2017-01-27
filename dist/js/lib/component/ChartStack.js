"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../core/index");
var index_2 = require("../shared/index");
var Chart_1 = require("./Chart");
var Crosshair_1 = require("./Crosshair");
var Grid_1 = require("./Grid");
var ChartStack = (function (_super) {
    __extends(ChartStack, _super);
    function ChartStack(offset, size, timeAxis, yAxis) {
        var _this = _super.call(this, offset, size) || this;
        _this.timeAxis = timeAxis;
        _this.yAxis = yAxis;
        _this.charts = [];
        // create crosshair
        _this.crosshair = new Crosshair_1.Crosshair({ x: 0, y: 0 }, { width: size.width, height: size.height });
        _this.addChild(_this.crosshair);
        // add grid
        var grid = new Grid_1.Grid({ x: 0, y: 0 }, { width: size.width, height: size.height }, timeAxis, yAxis);
        _this.addChild(grid);
        return _this;
    }
    ChartStack.prototype.addChart = function (chartType, dataSource) {
        var newChart = new Chart_1.Chart(chartType, new index_2.Point(this.offset.x, this.offset.y), { width: this.size.width, height: this.size.height }, dataSource, this.timeAxis, this.yAxis);
        this.charts.push(newChart);
        this.addChild(newChart);
    };
    ChartStack.prototype.render = function (context, renderLocator) {
        if (context.renderBase) {
            var canvas = context.getCanvas(this.target);
            // 1. Update y axis before rendering charts
            //
            // TODO: Make DataSource.DefaultYRange or take last known data:
            var yRange = { start: Number.MAX_VALUE, end: Number.MIN_VALUE };
            for (var _i = 0, _a = this.charts; _i < _a.length; _i++) {
                var chart = _a[_i];
                var valuesRange = chart.getValuesRange(this.timeAxis.range, this.timeAxis.interval);
                if (valuesRange.end > yRange.end) {
                    yRange.end = valuesRange.end;
                }
                if (valuesRange.start < yRange.start) {
                    yRange.start = valuesRange.start;
                }
            }
            if (this.charts.length > 0) {
                this.yAxis.range = yRange;
            }
            else {
                this.yAxis.range = { start: 0, end: 100 }; // default values
            }
        }
        _super.prototype.render.call(this, context, renderLocator);
        // // 2. Render charts
        // for (const chart of this.charts) {
        //     chart.render(context, renderLocator);
        // }
        // // 3. Render additional objects
        // //
        // this.crosshair.render(context, renderLocator);
    };
    return ChartStack;
}(index_1.VisualComponent));
exports.ChartStack = ChartStack;
