"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * ChartStack class.
 */
var index_1 = require("../axes/index");
var index_2 = require("../core/index");
var index_3 = require("../shared/index");
var Chart_1 = require("./Chart");
var ChartStack = (function (_super) {
    __extends(ChartStack, _super);
    function ChartStack(area, offset, timeAxis) {
        var _this = _super.call(this, offset) || this;
        _this.area = area;
        _this.timeAxis = timeAxis;
        _this.charts = [];
        // create initial Y axis
        _this.yAxis = new index_1.NumberAxis(_this.area.axisYContext.h, 1);
        return _this;
    }
    ChartStack.prototype.addChart = function (chartType, dataSource) {
        var newChart = new Chart_1.Chart(chartType, new index_3.Point(this.offset.x, this.offset.y), this.area.mainContext, dataSource, this.timeAxis, this.yAxis);
        this.charts.push(newChart);
        this.addChild(newChart);
    };
    ChartStack.prototype.render = function (context, renderLocator) {
        this.area.mainContext.clear();
        this.area.axisXContext.clear();
        this.area.axisYContext.clear();
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
        // 2. Render charts
        _super.prototype.render.call(this, context, renderLocator);
        // 3. Render additional objects
        //
        if (context.mousePosition) {
            // ... calculate mouse position related to this element
            var mouseX = context.mousePosition.x - this.offset.x;
            var mouseY = context.mousePosition.y - this.offset.y;
            // TODO: move to specific renderer
            var canvas = this.area.mainContext;
            canvas.setStrokeStyle('black');
            canvas.beginPath();
            var text = "[" + mouseX + " " + mouseY + "]";
            //let w = canvas.measureText(text).width;
            canvas.strokeText(text, 0, 50);
            canvas.stroke();
            canvas.closePath();
            // Draw crosshair
            //
            if (mouseX > 0 && mouseX < this.area.mainContext.w) {
                // draw vertical line
                canvas.beginPath();
                canvas.moveTo(mouseX, 0);
                canvas.lineTo(mouseX, this.area.mainContext.h);
                canvas.stroke();
                canvas.closePath();
            }
            if (mouseY > 0 && mouseY < this.area.mainContext.h) {
                // draw horizontal line
                canvas.beginPath();
                canvas.moveTo(0, mouseY);
                canvas.lineTo(this.area.mainContext.w, mouseY);
                canvas.stroke();
                canvas.closePath();
            }
        }
    };
    return ChartStack;
}(index_2.VisualComponent));
exports.ChartStack = ChartStack;
