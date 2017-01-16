define(["require", "exports", "shared/Event"], function (require, exports, Event_1) {
    "use strict";
    var SimpleIndicator = (function () {
        function SimpleIndicator(dataSource) {
            this.dataSource = dataSource;
            this.dateChangedEvent = new Event_1.Event();
            dataSource.dateChanged.on(this.onDataSourceChanged);
        }
        Object.defineProperty(SimpleIndicator.prototype, "dateChanged", {
            get: function () {
                return this.dateChangedEvent;
            },
            enumerable: true,
            configurable: true
        });
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
                data: indicator,
                minOrdinateValue: sourceData.minOrdinateValue,
                maxOrdinateValue: sourceData.maxOrdinateValue
            };
        };
        SimpleIndicator.prototype.onDataSourceChanged = function (arg) {
            this.dateChangedEvent.trigger();
        };
        return SimpleIndicator;
    }());
    exports.SimpleIndicator = SimpleIndicator;
});
