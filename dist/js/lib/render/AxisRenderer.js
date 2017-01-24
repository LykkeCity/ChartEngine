/**
 * AxisRenderer
 *
 * @classdesc Contains methods for rendering axes.
 */
"use strict";
var AxisRenderer = (function () {
    function AxisRenderer() {
    }
    AxisRenderer.prototype.renderDateAxis = function (dateAxis, canvas) {
        var scaleFit = new ScaleFit(dateAxis.width, dateAxis.interval, dateAxis.range);
        var bars = scaleFit.getBars();
        canvas.setStrokeStyle('black');
        canvas.beginPath();
        for (var _i = 0, bars_1 = bars; _i < bars_1.length; _i++) {
            var bar = bars_1[_i];
            var x = dateAxis.toX(bar);
            this.drawBar(canvas, bar, x);
        }
        canvas.stroke();
        canvas.closePath();
    };
    AxisRenderer.prototype.drawBar = function (canvas, date, x) {
        // draw bar
        canvas.moveTo(x, 7);
        canvas.lineTo(x, 10);
        // draw time mark
        // TODO: Use toString("yyyy-mm...")
        var markText = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
        var w = canvas.measureText(markText).width;
        canvas.strokeText(markText, x - w / 2, 25);
        //console.debug(`bar line: {${x},${7}} - {${x},${10}}`);
    };
    return AxisRenderer;
}());
exports.AxisRenderer = AxisRenderer;
// Calculates how many bars should be placed on the chart and where it should be placed.
var ScaleFit = (function () {
    function ScaleFit(width, interval, range) {
        this.scales = [
            60000,
            300000,
            600000,
            900000,
            1800000,
            3600000,
            14000000,
            21600000,
            43200000,
            86400000,
            259200000,
            604800000,
            864000000,
            2678400000,
        ];
        this.selectedScale = 0;
        this.interval = interval;
        this.range = range;
        // Calculate min and max count of bars that can be placed on the chart
        _a = this.getMinMaxBars(width), this.minBars = _a[0], this.maxBars = _a[1];
        // Choose fitting scale
        var dateRange = Math.abs(range.end.getTime() - range.start.getTime());
        this.selectedScale = 0;
        for (var _i = 0, _b = this.scales; _i < _b.length; _i++) {
            var scale = _b[_i];
            if (scale < interval) {
                continue;
            }
            // how many bars require this scale:
            var barsRequired = Math.ceil(dateRange / scale + 1);
            if (barsRequired >= this.minBars && barsRequired <= this.maxBars) {
                this.selectedScale = scale;
                break;
            }
        }
        var _a;
    }
    ScaleFit.prototype.getBars = function () {
        if (this.selectedScale == 0) {
            return [];
        }
        var bars = [];
        // Calculate first bar
        var bar;
        // ... if start time is placed on bar use it, otherwise calculate where first bar lays
        if (this.range.start.getTime() % this.selectedScale == 0) {
            bar = this.range.start;
        }
        else {
            // ... add scale value and truncate 
            var time = this.range.start.getTime() + this.selectedScale;
            bar = new Date(time - (time % this.selectedScale));
        }
        // Calculate remaining bars
        var t = bar.getTime();
        var end = this.range.end.getTime();
        while (t <= end) {
            bars.push(new Date(t));
            t += this.selectedScale;
        }
        return bars;
    };
    ScaleFit.prototype.getMinMaxBars = function (w) {
        // TODO: what if width does not allow any bars
        return [
            3,
            Math.max(w / 50) // maximum bars
        ];
    };
    return ScaleFit;
}());
