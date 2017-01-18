"use strict";
/**
 *
 */
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
    RenderLocator.prototype.getChartRender = function (uid) {
        switch (uid) {
            case 'line': return this.lineChartRender;
            case 'candle': return this.candlestickChartRender;
            default:
                throw new Error('Unexpected chart render uid: ' + uid);
        }
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
