"use strict";
/**
 * ChartArea class.
 */
var index_1 = require("../canvas/index");
var ChartArea = (function () {
    function ChartArea(w, h, baseCanvas, frontCanvas) {
        this.w = w;
        this.h = h;
        this._baseCanvas = baseCanvas;
        this._frontCanvas = frontCanvas;
        this._mainContext = this.getContext(baseCanvas, baseCanvas.width, baseCanvas.height);
        this._frontContext = this.getContext(frontCanvas, frontCanvas.width, frontCanvas.height);
    }
    Object.defineProperty(ChartArea.prototype, "mainContext", {
        get: function () {
            return this._mainContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChartArea.prototype, "frontContext", {
        get: function () {
            return this._frontContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChartArea.prototype, "baseCanvas", {
        get: function () {
            return this._baseCanvas;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChartArea.prototype, "frontCanvas", {
        get: function () {
            return this._frontCanvas;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChartArea.prototype, "width", {
        get: function () {
            return this.w;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChartArea.prototype, "height", {
        get: function () {
            return this.h;
        },
        enumerable: true,
        configurable: true
    });
    ChartArea.prototype.getContext = function (el, w, h) {
        var ctx = el.getContext('2d');
        if (ctx == null) {
            throw new Error('Context is null');
        }
        return new index_1.CanvasWrapper(ctx, w, h);
    };
    return ChartArea;
}());
exports.ChartArea = ChartArea;
