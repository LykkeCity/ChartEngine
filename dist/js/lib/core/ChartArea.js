"use strict";
/**
 * ChartArea class.
 */
var canvas_1 = require("../canvas");
var ChartArea = (function () {
    function ChartArea(mainCanvas, axisXCanvas, axisYCanvas) {
        this._mainContext = this.getContext(mainCanvas, mainCanvas.width, mainCanvas.height);
        this._axisXContext = this.getContext(axisXCanvas, axisXCanvas.width, axisXCanvas.height);
        this._axisYContext = this.getContext(axisYCanvas, axisYCanvas.width, axisYCanvas.height);
    }
    Object.defineProperty(ChartArea.prototype, "mainContext", {
        get: function () {
            return this._mainContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChartArea.prototype, "axisXContext", {
        get: function () {
            return this._axisXContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChartArea.prototype, "axisYContext", {
        get: function () {
            return this._axisYContext;
        },
        enumerable: true,
        configurable: true
    });
    ChartArea.prototype.getContext = function (el, w, h) {
        var ctx = el.getContext('2d');
        if (ctx == null) {
            throw new Error('Context is null');
        }
        return new canvas_1.CanvasWrapper(ctx, w, h);
    };
    return ChartArea;
}());
exports.ChartArea = ChartArea;
