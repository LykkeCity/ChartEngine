/**
 * SimpleIndicator class.
 */
"use strict";
var shared_1 = require("../shared");
var SimpleIndicator = (function () {
    function SimpleIndicator(dataSource) {
        this.dataSource = dataSource;
        this.dateChangedEvent = new shared_1.Event();
        dataSource.dateChanged.on(this.onDataSourceChanged);
    }
    Object.defineProperty(SimpleIndicator.prototype, "dateChanged", {
        get: function () {
            return this.dateChangedEvent;
        },
        enumerable: true,
        configurable: true
    });
    SimpleIndicator.prototype.getValuesRange = function (range) {
        return this.dataSource.getValuesRange(range);
    };
    SimpleIndicator.prototype.getData = function (range) {
        var indicator = [];
        var sourceData = this.dataSource.getData(range);
        for (var i = 3; i < sourceData.data.length; i++) {
            var value = (sourceData.data[i - 3].c
                + sourceData.data[i - 2].c
                + sourceData.data[i - 1].c) / 3;
            indicator.push({ date: sourceData.data[i].date, value: value });
        }
        return {
            data: indicator
        };
    };
    SimpleIndicator.prototype.onDataSourceChanged = function (arg) {
        this.dateChangedEvent.trigger();
    };
    return SimpleIndicator;
}());
exports.SimpleIndicator = SimpleIndicator;
