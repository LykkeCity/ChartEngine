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
    function NumberAxis(offset, size, interval, // Defines maximum zoom
        initialRange) {
        var _this = _super.call(this, offset, size) || this;
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
    NumberAxis.prototype.getValuesRange = function (x1, x2) {
        if (x1 > 0 && x2 > 0 && x1 < this.size.height && x2 < this.size.height) {
            return {
                start: this.toValue(Math.min(x1, x2)),
                end: this.toValue(Math.max(x1, x2))
            };
        }
    };
    NumberAxis.prototype.toValue = function (x) {
        var range = Math.abs(this.range.end - this.range.start);
        var base = Math.min(this.range.end, this.range.start);
        var d = x / this.size.height;
        return d * range + base;
    };
    NumberAxis.prototype.toX = function (value) {
        var range = Math.abs(this.range.end - this.range.start);
        var base = Math.min(this.range.end, this.range.start);
        var d = (value - base) / range;
        return d * this.size.height;
    };
    NumberAxis.prototype.move = function (direction) {
    };
    NumberAxis.prototype.scale = function (direction) {
    };
    NumberAxis.prototype.render = function (context, renderLocator) {
        if (context.renderBase) {
            var canvas = context.getCanvas(this.target);
            var render = renderLocator.getAxesRender('number');
            render.render(canvas, this, { x: 0, y: 0 }, this.size);
        }
        _super.prototype.render.call(this, context, renderLocator);
    };
    return NumberAxis;
}(index_1.VisualComponent));
exports.NumberAxis = NumberAxis;
