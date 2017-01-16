define(["require", "exports"], function (require, exports) {
    "use strict";
    var CandlestickChartRenderer = (function () {
        function CandlestickChartRenderer() {
        }
        CandlestickChartRenderer.prototype.render = function (canvas, data, offsetX, offsetY, timeAxis, yAxis) {
            console.debug("[CandlestickChartRenderer] start rendering...");
            // Calculate size of frame
            var frameSize = {
                width: canvas.w,
                height: canvas.h
            };
            // Render
            //
            this.startRender(canvas);
            for (var _i = 0, _a = data.data; _i < _a.length; _i++) {
                var candle = _a[_i];
                this.renderCandle(canvas, timeAxis, yAxis, candle, frameSize);
            }
            this.finishRender(canvas);
        };
        CandlestickChartRenderer.prototype.startRender = function (canvas) {
        };
        CandlestickChartRenderer.prototype.finishRender = function (canvas) {
        };
        CandlestickChartRenderer.prototype.renderCandle = function (canvas, timeAxis, yAxis, candle, frameSize) {
            // Lower and upper ranges of the candle's body.
            //let bodyMin = Math.min(candle.o, candle.c);
            //let bodyMax = Math.max(candle.o, candle.c);
            // Startin drawing
            canvas.setStrokeStyle('#333333');
            canvas.beginPath();
            var x = timeAxis.toX(candle.date);
            var ocMin = yAxis.toX(Math.min(candle.o, candle.c)), ocMax = yAxis.toX(Math.max(candle.o, candle.c)), h = yAxis.toX(candle.h), l = yAxis.toX(candle.l);
            // Drawing upper shadow
            this.line(canvas, x, ocMax, x, h);
            // Drawing lower shadow
            this.line(canvas, x, l, x, ocMin);
            canvas.stroke();
            canvas.closePath();
            // Drawing body
            if (candle.c > candle.o) {
                canvas.setFillStyle('#008910');
            }
            else {
                canvas.setFillStyle('#D80300');
            }
            this.rect(canvas, x - 1, ocMin, x + 1, ocMax);
        };
        CandlestickChartRenderer.prototype.line = function (canvas, x1, y1, x2, y2) {
            console.debug("line: {" + x1 + "," + y1 + "} - {" + x2 + "," + y2 + "}");
            canvas.moveTo(x1, y1);
            canvas.lineTo(x2, y2);
        };
        CandlestickChartRenderer.prototype.rect = function (canvas, x1, y1, x2, y2) {
            console.debug("rect: {" + x1 + "," + y1 + "} - {" + x2 + "," + y2 + "}");
            canvas.fillRect(x1, y1, Math.abs(x2 - x1), Math.abs(y2 - y1));
            canvas.strokeRect(x1, y1, Math.abs(x2 - x1), Math.abs(y2 - y1));
        };
        return CandlestickChartRenderer;
    }());
    exports.CandlestickChartRenderer = CandlestickChartRenderer;
});
