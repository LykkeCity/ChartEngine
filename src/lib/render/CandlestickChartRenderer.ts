/**
 * CandlestickChartRenderer
 * 
 * @classdesc Renders specified data in a form of candlestick chart.
 */

import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
import { Candlestick } from '../model';
import { ISize } from '../shared';

export class CandlestickChartRenderer  {

    public constructor() { }

    public render(
        canvas: ICanvas,
        data: any,
        offsetX: number,
        offsetY: number,
        timeAxis: IAxis<Date>,
        yAxis: IAxis<number>): void {

        console.debug(`[CandlestickChartRenderer] start rendering...`);

        // Calculate size of frame

        let frameSize: ISize = {
            width: canvas.w,
            height: canvas.h
        };

        // Render
        //
        this.startRender(canvas);
        for (var candle of data.data) {
            this.renderCandle(canvas, timeAxis, yAxis, candle, frameSize);
        }
        this.finishRender(canvas);
    }

    private startRender(canvas: ICanvas): void {

    }

    private finishRender(canvas: ICanvas): void {

    }

    private renderCandle(canvas: ICanvas, 
        timeAxis: IAxis<Date>,
        yAxis: IAxis<number>, candle: Candlestick, frameSize: ISize): void {

        // Lower and upper ranges of the candle's body.
        //let bodyMin = Math.min(candle.o, candle.c);
        //let bodyMax = Math.max(candle.o, candle.c);

        // Startin drawing
        canvas.setStrokeStyle('#333333');
        canvas.beginPath();

        let x = timeAxis.toX(candle.date);
        let ocMin = yAxis.toX(Math.min(candle.o, candle.c)),
            ocMax = yAxis.toX(Math.max(candle.o, candle.c)),
            h = yAxis.toX(candle.h),
            l = yAxis.toX(candle.l);

        // Drawing upper shadow
        this.line(canvas, x, ocMax, x, h );

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

        this.rect(canvas, x - 1, ocMin, x + 1, ocMax
        );
    }

    private line(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number): void {
        console.debug(`line: {${x1},${y1}} - {${x2},${y2}}`);
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    }

    private rect(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number): void {
        console.debug(`rect: {${x1},${y1}} - {${x2},${y2}}`);
        canvas.fillRect(x1, y1, Math.abs(x2 - x1), Math.abs(y2-y1));
        canvas.strokeRect(x1, y1, Math.abs(x2 - x1), Math.abs(y2 - y1));
    }
}
