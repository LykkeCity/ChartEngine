"use strict";
/**
 * Core enumerations.
 */
var TimeInterval;
(function (TimeInterval) {
    // TODO: Number can vary.
    TimeInterval[TimeInterval["month"] = 2592000000] = "month";
    TimeInterval[TimeInterval["week"] = 604800000] = "week";
    TimeInterval[TimeInterval["day"] = 86400000] = "day";
    TimeInterval[TimeInterval["hours4"] = 14400000] = "hours4";
    TimeInterval[TimeInterval["hour"] = 3600000] = "hour";
    TimeInterval[TimeInterval["min30"] = 1800000] = "min30";
    TimeInterval[TimeInterval["min15"] = 900000] = "min15";
    TimeInterval[TimeInterval["min5"] = 300000] = "min5";
    TimeInterval[TimeInterval["min"] = 60000] = "min";
})(TimeInterval = exports.TimeInterval || (exports.TimeInterval = {}));
var Unit;
(function (Unit) {
    Unit[Unit["Price"] = 0] = "Price";
})(Unit = exports.Unit || (exports.Unit = {}));
