"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require("../core");
var render_1 = require("../render");
var Chart = (function (_super) {
    __extends(Chart, _super);
    function Chart(offset, canvas, dataSource, timeAxis, yAxis, renderType) {
        var _this = _super.call(this, offset) || this;
        _this.canvas = canvas;
        _this.dataSource = dataSource;
        _this.timeAxis = timeAxis;
        _this.yAxis = yAxis;
        _this.renderType = renderType;
        return _this;
    }
    Chart.prototype.render = function (context, renderLocator) {
        var renderType = '';
        if (this.renderType === render_1.RenderType.Candlestick) {
            renderType = 'candle';
        }
        else if (this.renderType === render_1.RenderType.Line) {
            renderType = 'line';
        }
        else {
            throw new Error("Unexpected render type " + this.renderType);
        }
        var render = renderLocator.getChartRender(renderType);
        var data = this.dataSource.getData(this.timeAxis.range);
        render.render(this.canvas, data, 0, 0, this.timeAxis, this.yAxis);
        _super.prototype.render.call(this, context, renderLocator);
    };
    return Chart;
}(core_1.VisualComponent));
exports.Chart = Chart;
