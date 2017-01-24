"use strict";
/**
 *
 */
var index_1 = require("../core/index");
var index_2 = require("../model/index");
var AxisRenderer_1 = require("./AxisRenderer");
var CandlestickChartRenderer_1 = require("./CandlestickChartRenderer");
var LineChartRenderer_1 = require("./LineChartRenderer");
var RenderLocator = (function () {
    function RenderLocator() {
        this.candlestickChartRender = new CandlestickChartRenderer_1.CandlestickChartRenderer();
        this.lineChartRender = new LineChartRenderer_1.LineChartRenderer();
        this.axisRenderer = new AxisRenderer_1.AxisRenderer();
    }
    Object.defineProperty(RenderLocator, "Instance", {
        get: function () {
            return this.instance || (this.instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    //public getChartRender(chartType: string, dataType: string): any { //IChartRender<T> 
    RenderLocator.prototype.getChartRender = function (dataType, chartType) {
        var obj = new dataType(new Date());
        if (obj instanceof index_2.Point) {
            if (chartType === index_1.ChartType.line) {
                return this.lineChartRender;
            }
        }
        else if (obj instanceof index_2.Candlestick) {
            if (chartType === index_1.ChartType.candle) {
                return this.candlestickChartRender;
            }
        }
        else {
            throw new Error('Unexpected data type: ' + dataType);
        }
        throw new Error('Unexpected chart type ' + chartType);
    };
    RenderLocator.prototype.getAxesRender = function (uid) {
        switch (uid) {
            case 'date': return this.axisRenderer;
            default:
                throw new Error('Unexpected axes render uid: ' + uid);
        }
    };
    RenderLocator.prototype.getPopupRender = function (uid) {
        throw new Error('Not implemented.');
    };
    RenderLocator.prototype.getMarkRender = function (uid) {
        throw new Error('Not implemented.');
    };
    return RenderLocator;
}());
exports.RenderLocator = RenderLocator;
