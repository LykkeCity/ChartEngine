"use strict";
var DataChangedArgument = (function () {
    function DataChangedArgument(range, interval) {
        this._range = range;
        this._interval = interval;
    }
    Object.defineProperty(DataChangedArgument.prototype, "range", {
        get: function () {
            return this._range;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataChangedArgument.prototype, "interval", {
        get: function () {
            return this._interval;
        },
        enumerable: true,
        configurable: true
    });
    return DataChangedArgument;
}());
exports.DataChangedArgument = DataChangedArgument;
