"use strict";
/**
 * ChartStack class.
 */
var Chart_1 = require("./Chart");
var axes_1 = require("../axes");
var render_1 = require("../render");
var ChartStack = (function () {
    function ChartStack(area, timeAxis) {
        this.area = area;
        this.timeAxis = timeAxis;
        this.charts = [];
    }
    ChartStack.prototype.addChart = function (dataSource, renderType) {
        var newChart = new Chart_1.Chart(dataSource, renderType);
        this.charts.push(newChart);
    };
    ChartStack.prototype.render = function () {
        this.area.mainContext.clear();
        this.area.axisXContext.clear();
        this.area.axisYContext.clear();
        var height = this.area.axisYContext.h;
        for (var _i = 0, _a = this.charts; _i < _a.length; _i++) {
            var chart = _a[_i];
            var data = chart.dataSource.getData(this.timeAxis.range);
            var yAxis = new axes_1.NumberAxis(height, 1, { start: data.minOrdinateValue, end: data.maxOrdinateValue });
            if (chart.renderType === render_1.RenderType.Candlestick) {
                var candleRender = new render_1.CandlestickChartRenderer();
                candleRender.render(this.area.mainContext, data, 0, 0, this.timeAxis, yAxis);
            }
            else if (chart.renderType === render_1.RenderType.Line) {
                render_1.LineChartRenderer.render(this.area.mainContext, data, 0, 0, this.timeAxis, yAxis);
            }
            else {
                throw new Error("Unexpected RenderType " + chart.renderType);
            }
        }
        // render axis
        render_1.AxisRenderer.renderDateAxis(this.timeAxis, this.area.axisXContext);
    };
    return ChartStack;
}());
exports.ChartStack = ChartStack;
