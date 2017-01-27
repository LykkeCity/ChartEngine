/**
 * CandlestickChartRenderer
 * 
 * @classdesc Renders specified data in a form of candlestick chart.
 */

import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IPoint, IRect, ISize } from '../shared/index';
import { IChartRender } from './Interfaces';

export class CandlestickChartRenderer implements IChartRender<Candlestick>  {

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
    }

    public testHitArea(
            hitPoint: IPoint,
            dataIterator: IDataIterator<Candlestick>,
            frame: IRect,
            timeAxis: IAxis<Date>,
            yAxis: IAxis<number>): Candlestick | undefined {

        let candleHit: Candlestick | undefined = undefined;

        while (dataIterator.moveNext()) {
            if (this.testHitAreaCandle(hitPoint, timeAxis, yAxis, dataIterator.current)) {
                candleHit = dataIterator.current;
                break;
            }
        }

        return candleHit;
    }

    private testHitAreaCandle(hitPoint: IPoint, timeAxis: IAxis<Date>, yAxis: IAxis<number>, candle: Candlestick): boolean {
        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return false;
        }
        const x = timeAxis.toX(candle.date);
        const body = this.calculateBody(x, yAxis, candle.o, candle.c);
        return (hitPoint.x >= body.x && hitPoint.x <= (body.x + body.w)
                && hitPoint.y >= body.y && hitPoint.y <= (body.y + body.h));
    }

    private renderCandle(canvas: ICanvas, timeAxis: IAxis<Date>, yAxis: IAxis<number>, candle: Candlestick, frame: IRect): void {

        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }

        // Startin drawing
        canvas.lineWidth = 1;
        canvas.setStrokeStyle('#333333');
        canvas.beginPath();

        const x = timeAxis.toX(candle.date);
        const body = this.calculateBody(x, yAxis, candle.o, candle.c);
        const h = yAxis.toX(candle.h);
        const l = yAxis.toX(candle.l);

        // Drawing upper shadow
        this.line(canvas, x, body.y, x, h );

        // Drawing lower shadow
        this.line(canvas, x, l, x, body.y + body.h);

        canvas.stroke();
        canvas.closePath();

        // Drawing body
        if (candle.c > candle.o) {
            canvas.setFillStyle('#008910');
        } else {
            canvas.setFillStyle('#D80300');
        }

        canvas.fillRect(body.x, body.y, body.w, body.h);
        canvas.strokeRect(body.x, body.y, body.w, body.h);
    }

    private calculateBody(x: number, yAxis: IAxis<number>, o: number, c: number): IRect {
        const ocMin = yAxis.toX(Math.min(o, c));
        const ocMax = yAxis.toX(Math.max(o, c));
        return { x: x - 1, y: ocMin, w: 2, h: ocMax - ocMin };
    }

    private line(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number): void {
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    }
}
