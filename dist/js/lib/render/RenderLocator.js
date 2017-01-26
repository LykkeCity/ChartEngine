"use strict";
/**
 * RenderLocator singleton.
 */
var index_1 = require("../core/index");
var index_2 = require("../model/index");
var CandlestickChartRenderer_1 = require("./CandlestickChartRenderer");
var CandlestickPopupRenderer_1 = require("./CandlestickPopupRenderer");
var LineChartRenderer_1 = require("./LineChartRenderer");
var LinePopupRenderer_1 = require("./LinePopupRenderer");
var NumberAxisRenderer_1 = require("./NumberAxisRenderer");
var NumberMarkRenderer_1 = require("./NumberMarkRenderer");
var PriceAxisRenderer_1 = require("./PriceAxisRenderer");
var TimeAxisRenderer_1 = require("./TimeAxisRenderer");
var TimeMarkRenderer_1 = require("./TimeMarkRenderer");
var RenderLocator = (function () {
    function RenderLocator() {
        this.candlestickChartRender = new CandlestickChartRenderer_1.CandlestickChartRenderer();
        this.lineChartRender = new LineChartRenderer_1.LineChartRenderer();
        this.timeAxisRender = new TimeAxisRenderer_1.TimeAxisRenderer();
        this.priceAxisRender = new PriceAxisRenderer_1.PriceAxisRenderer();
        this.numberAxisRender = new NumberAxisRenderer_1.NumberAxisRenderer();
        this.candlePopupRenderer = new CandlestickPopupRenderer_1.CandlestickPopupRenderer();
        this.linePopupRenderer = new LinePopupRenderer_1.LinePopupRenderer();
        this.timeMarkRender = new TimeMarkRenderer_1.TimeMarkRenderer();
        this.numberMarkRender = new NumberMarkRenderer_1.NumberMarkRenderer();
    }
    Object.defineProperty(RenderLocator, "Instance", {
        get: function () {
            return this.instance || (this.instance = new this());
        },
        enumerable: true,
        configurable: true
    });
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
            case 'date': return this.timeAxisRender;
            case 'number': return this.numberAxisRender;
            case 'price': return this.priceAxisRender;
            default:
                throw new Error('Unexpected axes render uid: ' + uid);
        }
    };
    RenderLocator.prototype.getPopupRender = function (dataType) {
        var obj = new dataType(new Date());
        if (obj instanceof index_2.Point) {
            return this.linePopupRenderer;
        }
        else if (obj instanceof index_2.Candlestick) {
            return this.candlePopupRenderer;
        }
        else {
            throw new Error('Unexpected data type: ' + dataType);
        }
    };
    RenderLocator.prototype.getMarkRender = function (uid) {
        switch (uid) {
            case 'date': return this.timeMarkRender;
            case 'number': return this.numberMarkRender;
            default:
                throw new Error('Unexpected axes render uid: ' + uid);
        }
    };
    return RenderLocator;
}());
exports.RenderLocator = RenderLocator;
