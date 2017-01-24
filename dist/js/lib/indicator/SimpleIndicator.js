"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../data/index");
var index_2 = require("../model/index");
var SimpleIndicator = (function (_super) {
    __extends(SimpleIndicator, _super);
    function SimpleIndicator(config, dataSource) {
        var _this = _super.call(this, index_2.Point, config) || this;
        _this.dataSource = dataSource;
        _this.dataInitialized = false;
        _this.dataSnapshot = { data: [], timestamp: 0 };
        dataSource.dateChanged.on(_this.onDataSourceChanged);
        return _this;
    }
    SimpleIndicator.prototype.getValuesRange = function (range, interval) {
        return this.dataSource.getValuesRange(range, interval);
    };
    SimpleIndicator.prototype.getData = function (range, interval) {
        if (!this.dataInitialized) {
            // Get data from the data source
            // 
            this.update(range, interval);
        }
        var data = this.dataSnapshot.data;
        // Find first and last indexes.
        //
        var startIndex = 0;
        for (startIndex = 0; startIndex < data.length; startIndex++) {
            if (data[startIndex].date.getTime() >= range.start.getTime()) {
                break;
            }
        }
        var lastIndex = data.length - 1;
        for (lastIndex = data.length - 1; lastIndex >= startIndex; lastIndex--) {
            if (data[startIndex].date.getTime() <= range.end.getTime()) {
                break;
            }
        }
        return new index_1.ArrayIterator(this.dataSnapshot, startIndex, lastIndex, this.dataSnapshot.timestamp);
    };
    SimpleIndicator.prototype.getDefaultConfig = function () {
        return new index_1.DataSourceConfig();
    };
    SimpleIndicator.prototype.onDataSourceChanged = function (arg) {
        if (arg) {
            // recalculate and notify
            this.update(arg.range, arg.interval);
            this.dateChangedEvent.trigger(new index_1.DataChangedArgument(arg.range, arg.interval));
        }
    };
    SimpleIndicator.prototype.update = function (range, interval) {
        var prevValues = [0, 0];
        var iterator = this.dataSource.getData(range, interval);
        // Skip first values
        var i = 0;
        while (i < 2 && iterator.moveNext()) {
            var candle = iterator.current;
            if (candle.c) {
                prevValues[i] = candle.c;
            }
            i++;
        }
        i = 0;
        while (iterator.moveNext()) {
            if (iterator.current.c) {
                var curValue = iterator.current.c;
                // calculate indicator value
                var indicatorValue = (prevValues[0] + prevValues[1] + curValue) / 3;
                this.dataSnapshot.data[i] = new index_2.Point(iterator.current.date, indicatorValue);
                // shift previous values
                prevValues[0] = prevValues[1];
                prevValues[1] = curValue;
            }
            i++;
        }
        // update timestamp
        this.dataSnapshot.timestamp = this.dataSnapshot.timestamp + 1;
    };
    return SimpleIndicator;
}(index_1.DataSource));
exports.SimpleIndicator = SimpleIndicator;
