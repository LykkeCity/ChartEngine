/**
 * TimeAxis class
 *
 * @classdesc Represents a chart's axis of numbers
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../core/index");
var TimeAxis = (function (_super) {
    __extends(TimeAxis, _super);
    function TimeAxis(offset, size, interval, // Defines maximum zoom
        initialRange) {
        var _this = _super.call(this, offset, size) || this;
        _this._interval = interval;
        _this._range = initialRange;
        return _this;
    }
    Object.defineProperty(TimeAxis.prototype, "range", {
        get: function () {
            return this._range;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeAxis.prototype, "interval", {
        get: function () {
            return this._interval;
        },
        enumerable: true,
        configurable: true
    });
    TimeAxis.prototype.getValuesRange = function (x1, x2) {
        if (x1 > 0 && x2 > 0 && x1 < this.size.width && x2 < this.size.width) {
            return {
                start: this.toValue(Math.min(x1, x2)),
                end: this.toValue(Math.max(x1, x2))
            };
        }
    };
    TimeAxis.prototype.toValue = function (x) {
        var range = Math.abs(this.range.end.getTime() - this.range.start.getTime());
        var base = Math.min(this.range.end.getTime(), this.range.start.getTime());
        var d = x / this.size.width;
        return new Date(d * range + base);
    };
    TimeAxis.prototype.toX = function (value) {
        if (value < this.range.start || value > this.range.end) {
            throw new Error("Date " + value + " is out of range.");
        }
        var range = Math.abs(this.range.end.getTime() - this.range.start.getTime());
        var base = Math.min(this.range.end.getTime(), this.range.start.getTime());
        var toDate = value.getTime() - base;
        return (toDate / range) * this.size.width;
    };
    TimeAxis.prototype.move = function (direction) {
        //direction = Math.round(direction);
        if (direction == 0) {
            return;
        }
        var curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods
        var shiftInMs = direction * curRangeInMs / this.size.width;
        this._range = {
            start: new Date(this.range.start.getTime() - shiftInMs),
            end: new Date(this.range.end.getTime() - shiftInMs)
        };
    };
    TimeAxis.prototype.scale = function (direction) {
        var curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods
        var newRange = 0;
        // Move date to the specified direction
        if (direction > 0) {
            newRange = curRangeInMs * 0.9;
            if (newRange / this.interval < 10) {
                newRange = this.interval * 10;
            }
        }
        else if (direction < 0) {
            newRange = curRangeInMs * 1.1;
            if (newRange / this.interval > 1000) {
                newRange = this.interval * 1000;
            }
        }
        this._range = {
            start: new Date(this.range.end.getTime() - newRange),
            end: this.range.end
        };
    };
    TimeAxis.prototype.render = function (context, renderLocator) {
        if (context.renderBase) {
            var canvas = context.getCanvas(this.target);
            var render = renderLocator.getAxesRender('date');
            render.render(canvas, this, this.offset, this.size);
        }
        _super.prototype.render.call(this, context, renderLocator);
    };
    return TimeAxis;
}(index_1.VisualComponent));
exports.TimeAxis = TimeAxis;
