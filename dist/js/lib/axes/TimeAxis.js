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
    function TimeAxis(canvas, width, interval, // Defines maximum zoom
        initialRange) {
        var _this = _super.call(this) || this;
        _this.canvas = canvas;
        _this._w = width;
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
    Object.defineProperty(TimeAxis.prototype, "width", {
        get: function () {
            return this._w;
        },
        enumerable: true,
        configurable: true
    });
    TimeAxis.prototype.toX = function (value) {
        if (value < this.range.start || value > this.range.end) {
            throw new Error("Date " + value + " is out of range.");
        }
        var total = Math.abs(this.range.end.getTime() - this.range.start.getTime());
        var toDate = Math.abs(value.getTime() - this.range.start.getTime());
        var x = (toDate / total) * this.width;
        return x;
    };
    TimeAxis.prototype.move = function (direction) {
        //direction = Math.round(direction);
        if (direction == 0) {
            return;
        }
        var curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods
        var shiftInMs = direction * curRangeInMs / this.width;
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
        var render = renderLocator.getAxesRender('date');
        render.renderDateAxis(this, this.canvas);
    };
    return TimeAxis;
}(index_1.VisualComponent));
exports.TimeAxis = TimeAxis;
