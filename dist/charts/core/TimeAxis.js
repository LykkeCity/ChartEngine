define(["require", "exports"], function (require, exports) {
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
        };
        NumberAxis.prototype.scale = function (direction) {
        };
        return NumberAxis;
    }());
    exports.NumberAxis = NumberAxis;
    var TimeAxis = (function () {
        function TimeAxis(width, interval, // Defines maximum zoom
            initialRange) {
            this._w = width;
            this._interval = interval;
            this._range = initialRange;
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
        return TimeAxis;
    }());
    exports.TimeAxis = TimeAxis;
});
