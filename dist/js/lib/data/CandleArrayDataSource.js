/**
 * CandleArrayDataSource class.
 */
"use strict";
var shared_1 = require("../shared");
var CandleArrayDataSource = (function () {
    function CandleArrayDataSource(data) {
        this.data = data;
        this.dateChangedEvent = new shared_1.Event();
        this.defaultMinValue = 0;
        this.defaultMaxValue = 100;
    }
    Object.defineProperty(CandleArrayDataSource.prototype, "dateChanged", {
        get: function () {
            return this.dateChangedEvent;
        },
        enumerable: true,
        configurable: true
    });
    CandleArrayDataSource.prototype.getValuesRange = function (range) {
        if (this.data.length === 0) {
            return { start: this.defaultMinValue, end: this.defaultMaxValue };
        }
        var lowestPrice = Number.MAX_VALUE;
        var highestPrice = Number.MIN_VALUE;
        // Filter data by date and find min/max price
        //
        this.data.forEach(function (candle) {
            if (candle.date >= range.start && candle.date <= range.end) {
                // update min / max values
                if (candle.l < lowestPrice) {
                    lowestPrice = candle.l;
                }
                if (candle.h > highestPrice) {
                    highestPrice = candle.h;
                }
            }
        });
        return { start: lowestPrice, end: highestPrice };
    };
    CandleArrayDataSource.prototype.getData = function (range) {
        var lowestPrice = Number.MAX_VALUE;
        var highestPrice = Number.MIN_VALUE;
        // Filter data by date and find min/max price
        //
        var filteredData = this.data.filter(function (candle) {
            if (candle.date >= range.start && candle.date <= range.end) {
                // update min / max values
                if (candle.l < lowestPrice) {
                    lowestPrice = candle.l;
                }
                if (candle.h > highestPrice) {
                    highestPrice = candle.h;
                }
                return true;
            }
            return false;
        });
        console.debug("Data Source: min: " + lowestPrice + " max: " + highestPrice + " data.count: " + filteredData.length);
        return {
            data: filteredData
        };
    };
    return CandleArrayDataSource;
}());
exports.CandleArrayDataSource = CandleArrayDataSource;
