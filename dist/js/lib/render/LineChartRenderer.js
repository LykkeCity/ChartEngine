/**
 * LineChartRenderer
 *
 * @classdesc Renders specified data in a form of line chart.
 */
"use strict";
var LineChartRenderer = (function () {
    function LineChartRenderer() {
    }
    LineChartRenderer.prototype.render = function (canvas, dataIterator, offsetX, offsetY, timeAxis, yAxis) {
        // Calculate size of frame
        var frameSize = {
            width: canvas.w,
            height: canvas.h
        };
        // Render
        if (dataIterator.moveNext()) {
            var prevPoint = dataIterator.current;
            while (dataIterator.moveNext()) {
                if (dataIterator.current.value) {
                    this.renderPart(canvas, timeAxis, yAxis, prevPoint, dataIterator.current, frameSize);
                    prevPoint = dataIterator.current;
                }
            }
        }
    };
    LineChartRenderer.prototype.testHitArea = function (hitPoint, dataIterator, offsetX, offsetY, timeAxis, yAxis) {
        while (dataIterator.moveNext()) {
            if (dataIterator.current.value) {
                var x = timeAxis.toX(dataIterator.current.date);
                var y = yAxis.toX(dataIterator.current.value);
                var R = Math.sqrt(Math.pow(Math.abs(x - hitPoint.x), 2) + Math.pow(Math.abs(y - hitPoint.y), 2));
                if (R < 2) {
                    return dataIterator.current;
                }
            }
        }
    };
    LineChartRenderer.prototype.renderPart = function (canvas, timeAxis, yAxis, pointFrom, pointTo, frameSize) {
        // Startin drawing
        canvas.setStrokeStyle('#555555');
        canvas.beginPath();
        var x1 = timeAxis.toX(pointFrom.date);
        var y1 = yAxis.toX(pointFrom.value);
        var x2 = timeAxis.toX(pointTo.date);
        var y2 = yAxis.toX(pointTo.value);
        // Drawing upper shadow
        this.line(canvas, x1, y1, x2, y2);
        canvas.stroke();
        canvas.closePath();
    };
    LineChartRenderer.prototype.line = function (canvas, x1, y1, x2, y2) {
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    };
    return LineChartRenderer;
}());
exports.LineChartRenderer = LineChartRenderer;
