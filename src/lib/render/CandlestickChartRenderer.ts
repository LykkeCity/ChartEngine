/**
 * CandlestickChartRenderer
 * 
 * @classdesc Renders specified data in a form of candlestick chart.
 */

import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IPoint, IRect } from '../shared/index';
import { IChartRender } from './Interfaces';

export class CandlestickChartRenderer implements IChartRender<Candlestick>  {

    private readonly minCandleWidth = 3;
    private readonly maxCandleWidth = 21;

    public constructor() { }

    public render(
        canvas: ICanvas,
        dataIterator: IDataIterator<Candlestick>,
        frame: IRect,
        timeAxis: IAxis<Date>,
        yAxis: IAxis<number>): void {

        // Render
        //

        // border lines
        canvas.beginPath();
        canvas.setStrokeStyle('#333333');
        // ... left
        canvas.moveTo(frame.x, frame.y);
        canvas.lineTo(frame.x, frame.y + frame.h - 1);
        // ... bottom
        canvas.lineTo(frame.x + frame.w - 1, frame.y + frame.h - 1);
        // ... right
        canvas.lineTo(frame.x + frame.w - 1, frame.y);
        canvas.stroke();

        const candleW = this.calculateBodyWidth(timeAxis, frame.w);
        while (dataIterator.moveNext()) {
            this.renderCandle(canvas, timeAxis, yAxis, dataIterator.current, frame, candleW);
        }
    }

    public testHitArea(
            hitPoint: IPoint,
            dataIterator: IDataIterator<Candlestick>,
            frame: IRect,
            timeAxis: IAxis<Date>,
            yAxis: IAxis<number>): Candlestick | undefined {

        let candleHit: Candlestick | undefined = undefined;

        const candleW = this.calculateBodyWidth(timeAxis, frame.w);

        while (dataIterator.moveNext()) {
            if (this.testHitAreaCandle(hitPoint, timeAxis, yAxis, dataIterator.current, candleW)) {
                candleHit = dataIterator.current;
                break;
            }
        }

        return candleHit;
    }

    private testHitAreaCandle(
        hitPoint: IPoint, timeAxis: IAxis<Date>, yAxis: IAxis<number>, candle: Candlestick, candleW: number): boolean {
        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return false;
        }
        let  x = timeAxis.toX(candle.date);
        x = Math.round(x);

        const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);
        return (hitPoint.x >= body.x && hitPoint.x <= (body.x + body.w)
                && hitPoint.y >= body.y && hitPoint.y <= (body.y + body.h));
    }

    private renderCandle(
        canvas: ICanvas, timeAxis: IAxis<Date>, yAxis: IAxis<number>, candle: Candlestick, frame: IRect, candleW: number): void {

        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }

        // Startin drawing
        canvas.beginPath();
        canvas.lineWidth = 1;
        canvas.setStrokeStyle('#333333');

        let x = timeAxis.toX(candle.date);
        x = Math.round(x);

        const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);
        const h = yAxis.toX(candle.h);
        const l = yAxis.toX(candle.l);

        // Drawing upper shadow
        this.line(canvas, x, body.y, x, h );

        // Drawing lower shadow
        this.line(canvas, x, l, x, body.y + body.h - 1);

        canvas.stroke();

        // Drawing body
        if (candle.c > candle.o) {
            canvas.setFillStyle('#008910');
        } else {
            canvas.setFillStyle('#D80300');
        }

        canvas.fillRect(body.x, body.y, body.w, body.h);
        canvas.strokeRect(body.x, body.y, body.w, body.h);
    }

    private calculateBody(x: number, yAxis: IAxis<number>, o: number, c: number, candleW: number): IRect {
        const ocMin = yAxis.toX(Math.max(o, c)); // Inverted Y
        const ocMax = yAxis.toX(Math.min(o, c));
        return { x: x - Math.floor(candleW / 2), y: ocMin, w: candleW, h: ocMax - ocMin };
    }

    private calculateBodyWidth(timeAxis: IAxis<Date>, frameWidth: number): number {
        const range = timeAxis.range.end.getTime() - timeAxis.range.start.getTime();
        if (range === 0 || timeAxis.interval === 0) {
            return this.minCandleWidth;
        }
        const candlesCount = range / timeAxis.interval;
        let w = Math.floor(frameWidth / (3 * candlesCount));
        // make width odd (1, 3, 5, ...)
        w = w - ((w + 1) % 2);
        // between minCandleWidth and maxCandleWidth
        return Math.min(this.maxCandleWidth, Math.max(this.minCandleWidth, w));
    }

    private line(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number): void {
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    }
}
