"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../core/index");
var Chart = (function (_super) {
    __extends(Chart, _super);
    function Chart(chartType, offset, canvas, dataSource, timeAxis, yAxis) {
        var _this = _super.call(this, offset) || this;
        _this.chartType = chartType;
        _this.offset = offset;
        _this.canvas = canvas;
        _this.dataSource = dataSource;
        _this.timeAxis = timeAxis;
        _this.yAxis = yAxis;
        return _this;
    }
    Chart.prototype.getValuesRange = function (range, interval) {
        return this.dataSource.getValuesRange(range, interval);
    };
    Chart.prototype.render = function (context, renderLocator) {
        // let renderType = '';
        // if (this.renderType === RenderType.Candlestick) {
        //     renderType = 'candle';
        // } else if (this.renderType === RenderType.Line) {
        //     renderType = 'line';
        // } else {
        //     throw new Error(`Unexpected render type ${ this.renderType }`);
        // }
        var render = renderLocator.getChartRender(this.dataSource.dataType, this.chartType);
        var dataIterator = this.dataSource.getData(this.timeAxis.range, this.timeAxis.interval);
        render.render(this.canvas, dataIterator, 0, 0, this.timeAxis, this.yAxis);
        _super.prototype.render.call(this, context, renderLocator);
    };
    return Chart;
}(index_1.VisualComponent));
exports.Chart = Chart;
