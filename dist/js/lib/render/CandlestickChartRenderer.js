/**
 * CandlestickChartRenderer
 *
 * @classdesc Renders specified data in a form of candlestick chart.
 */
"use strict";
var CandlestickChartRenderer = (function () {
    function CandlestickChartRenderer() {
    }
    CandlestickChartRenderer.prototype.render = function (canvas, dataIterator, frame, timeAxis, yAxis) {
        // Render
        //
        // border lines
        canvas.setStrokeStyle('#333333');
        canvas.beginPath();
        // ... bottom
        canvas.moveTo(frame.x, frame.y + frame.h - 1);
        canvas.lineTo(frame.x + frame.w - 1, frame.y + frame.h - 1);
        // ... left
        canvas.moveTo(frame.x, frame.y);
        canvas.lineTo(frame.x, frame.y + frame.h - 1);
        // ... right
        canvas.moveTo(frame.x + frame.w - 1, frame.y);
        canvas.lineTo(frame.x + frame.w - 1, frame.y + frame.h - 1);
        canvas.stroke();
        canvas.closePath();
        while (dataIterator.moveNext()) {
            this.renderCandle(canvas, timeAxis, yAxis, dataIterator.current, frame);
        }
    };
    CandlestickChartRenderer.prototype.testHitArea = function (hitPoint, dataIterator, frame, timeAxis, yAxis) {
        var candleHit = undefined;
        while (dataIterator.moveNext()) {
            if (this.testHitAreaCandle(hitPoint, timeAxis, yAxis, dataIterator.current)) {
                candleHit = dataIterator.current;
                break;
            }
        }
        return candleHit;
    };
    CandlestickChartRenderer.prototype.testHitAreaCandle = function (hitPoint, timeAxis, yAxis, candle) {
        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return false;
        }
        var x = timeAxis.toX(candle.date);
        var body = this.calculateBody(x, yAxis, candle.o, candle.c);
        return (hitPoint.x >= body.x && hitPoint.x <= (body.x + body.w)
            && hitPoint.y >= body.y && hitPoint.y <= (body.y + body.h));
    };
    CandlestickChartRenderer.prototype.renderCandle = function (canvas, timeAxis, yAxis, candle, frame) {
        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }
        // Startin drawing
        canvas.lineWidth = 1;
        canvas.setStrokeStyle('#333333');
        canvas.beginPath();
        var x = timeAxis.toX(candle.date);
        var body = this.calculateBody(x, yAxis, candle.o, candle.c);
        var h = yAxis.toX(candle.h);
        var l = yAxis.toX(candle.l);
        // Drawing upper shadow
        this.line(canvas, x, body.y, x, h);
        // Drawing lower shadow
        this.line(canvas, x, l, x, body.y + body.h);
        canvas.stroke();
        canvas.closePath();
        // Drawing body
        if (candle.c > candle.o) {
            canvas.setFillStyle('#008910');
        }
        else {
            canvas.setFillStyle('#D80300');
        }
        canvas.fillRect(body.x, body.y, body.w, body.h);
        canvas.strokeRect(body.x, body.y, body.w, body.h);
    };
    CandlestickChartRenderer.prototype.calculateBody = function (x, yAxis, o, c) {
        var ocMin = yAxis.toX(Math.min(o, c));
        var ocMax = yAxis.toX(Math.max(o, c));
        return { x: x - 1, y: ocMin, w: 2, h: ocMax - ocMin };
    };
    CandlestickChartRenderer.prototype.line = function (canvas, x1, y1, x2, y2) {
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    };
    return CandlestickChartRenderer;
}());
exports.CandlestickChartRenderer = CandlestickChartRenderer;
