"use strict";
var Point = (function () {
    function Point(d, v) {
        this.date = d;
        this.value = v;
    }
    Point.prototype.getValues = function () {
        if (this.value) {
            return [this.value];
        }
        else {
            return [];
        }
    };
    Point.prototype.deserialize = function (data) {
        if (data && data.value) {
            this.value = data.value;
        }
    };
    return Point;
}());
exports.Point = Point;
