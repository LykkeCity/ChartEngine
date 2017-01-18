"use strict";
var NumberAxis = (function () {
    function NumberAxis(width, interval, // Defines maximum zoom
        initialRange) {
        this._w = width;
        this._interval = interval;
        this._range = initialRange;
    }
    Object.defineProperty(NumberAxis.prototype, "range", {
        get: function () {
            return this._range;
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
        direction = 0;
    };
    NumberAxis.prototype.scale = function (direction) {
        direction = 0;
    };
    return NumberAxis;
}());
exports.NumberAxis = NumberAxis;
