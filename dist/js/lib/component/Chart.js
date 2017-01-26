"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../core/index");
var ChartPopup_1 = require("./ChartPopup");
var Chart = (function (_super) {
    __extends(Chart, _super);
    function Chart(chartType, offset, size, dataSource, timeAxis, yAxis) {
        var _this = _super.call(this, offset, size) || this;
        _this.chartType = chartType;
        _this.dataSource = dataSource;
        _this.timeAxis = timeAxis;
        _this.yAxis = yAxis;
        _this.popup = new ChartPopup_1.ChartPopup(chartType, offset, size, dataSource, timeAxis, yAxis);
        _this.addChild(_this.popup);
        return _this;
    }
    Chart.prototype.getValuesRange = function (range, interval) {
        return this.dataSource.getValuesRange(range, interval);
    };
    Chart.prototype.render = function (context, renderLocator) {
        if (context.renderBase) {
            var canvas = context.getCanvas(this.target);
            var render = renderLocator.getChartRender(this.dataSource.dataType, this.chartType);
            var dataIterator = this.dataSource.getData(this.timeAxis.range, this.timeAxis.interval);
            render.render(canvas, dataIterator, 0, 0, this.timeAxis, this.yAxis);
        }
        _super.prototype.render.call(this, context, renderLocator);
    };
    return Chart;
}(index_1.VisualComponent));
exports.Chart = Chart;
