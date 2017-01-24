"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * NumberAxis class.
 */
var index_1 = require("../core/index");
var NumberAxis = (function (_super) {
    __extends(NumberAxis, _super);
    function NumberAxis(width, interval, // Defines maximum zoom
        initialRange) {
        var _this = _super.call(this) || this;
        _this._w = width;
        _this._interval = interval;
        _this._range = initialRange ? initialRange : { start: 0, end: 0 };
        return _this;
    }
    Object.defineProperty(NumberAxis.prototype, "range", {
        get: function () {
            return this._range;
        },
        set: function (newRange) {
            this._range = newRange;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberAxis.prototype, "interval", {
        get: function () {
            return this._interval;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberAxis.prototype, "width", {
        get: function () {
            return this._w;
        },
        enumerable: true,
        configurable: true
    });
    NumberAxis.prototype.toX = function (value) {
        var range = Math.abs(this.range.end - this.range.start);
        var min = Math.min(this.range.end, this.range.start);
        var d = this.width / (range);
        return d * (value - min);
    };
    NumberAxis.prototype.move = function (direction) {
    };
    NumberAxis.prototype.scale = function (direction) {
    };
    NumberAxis.prototype.render = function (context, renderLocator) {
        // const render = renderLocator.getAxesRender('date');
        // render.renderDateAxis(this, this.canvas);
    };
    return NumberAxis;
}(index_1.VisualComponent));
exports.NumberAxis = NumberAxis;
