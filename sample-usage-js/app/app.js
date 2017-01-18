define(["require", "exports", "core/Chart", "data/CandleArrayDataSource"], function (require, exports, Chart_1, CandleArrayDataSource_1) {
    "use strict";
    var Main = (function () {
        function Main() {
        }
        Main.startup = function () {
            console.debug("starting app...");
            var container = document.getElementById("chart-container");
            if (container != null) {
                console.debug("creating chart...");
                var chart = new Chart_1.ChartBoard(container, 500, 300, new CandleArrayDataSource_1.CandleArrayDataSource(Main.sampleData));
                chart.render();
            }
        };

        return Main;
    }());
    exports.Main = Main;
});