/**
 * RenkoChartRenderer
 * 
 * @classdesc Renders specified data in a form of renko chart.
 */
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { IAxis, ITimeAxis, SettingSet } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IPoint, IRect } from '../shared/index';
import { IChartRender } from './Interfaces';
import { RenderUtils } from './RenderUtils';

export class RenkoChartRenderer implements IChartRender<Candlestick>  {

    private readonly minCandleWidth = 3;
    private readonly maxCandleWidth = 21;

    public constructor() { }

    public render(
        canvas: ICanvas,
        dataIterator: IDataIterator<Candlestick>,
        //data: Candlestick[],
        frame: IRect,
        timeAxis: ITimeAxis,
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

        RenderUtils.iterate(timeAxis, dataIterator, (candle, x) => {
            this.renderCandle(canvas, timeAxis, yAxis, candle, frame, candleW, x);
        });
    }

    public testHitArea(
            hitPoint: IPoint,
            dataIterator: IDataIterator<Candlestick>,
            //data: Candlestick[],
            frame: IRect,
            timeAxis: ITimeAxis,
            yAxis: IAxis<number>): Candlestick | undefined {

        let candleHit: Candlestick | undefined = undefined;

        // const candleW = this.calculateBodyWidth(timeAxis, frame.w);

        // // while (dataIterator.moveNext()) {
        // //     if (this.testHitAreaCandle(hitPoint, timeAxis, yAxis, dataIterator.current, candleW)) {
        // //         candleHit = dataIterator.current;
        // //         break;
        // //     }
        // // }

        // data.forEach((value: Candlestick, index: number) => {
        //     if (this.testHitAreaCandle(hitPoint, timeAxis, yAxis, value, index, candleW)) {
        //         return value;
        //     }
        // });

        return candleHit;
    }

    private testHitAreaCandle(
        hitPoint: IPoint,
        timeAxis: ITimeAxis,
        yAxis: IAxis<number>,
        candle: Candlestick,
        candleW: number): boolean {
        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return false;
        }
        // TODO: Use prepaired X
        let x = timeAxis.toX(candle.uid);
        // let x = timeAxis.toX(index);
        if (x !== undefined) {
            x = Math.round(x);

            const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);
            return (hitPoint.x >= body.x && hitPoint.x <= (body.x + body.w)
                    && hitPoint.y >= body.y && hitPoint.y <= (body.y + body.h));
        }
        return false;
    }

    // private renderCandle(
    //     canvas: ICanvas, timeAxis: ITimeAxis, yAxis: IAxis<number>, candle: Candlestick, frame: IRect, candleW: number): void {

    //     if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
    //         return;
    //     }

    //     // // Startin drawing
    //     // canvas.beginPath();
    //     // canvas.lineWidth = 1;
    //     // canvas.setStrokeStyle('#333333');

    //     // //let x = timeAxis.toX(candle.date);
    //     // let x = timeAxis.toX(index);
    //     // x = Math.round(x);

    //     // const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);
    //     // const h = yAxis.toX(candle.h);
    //     // const l = yAxis.toX(candle.l);

    //     // canvas.stroke();

    //     // // Drawing body
    //     // if (candle.c > candle.o) {
    //     //     canvas.setFillStyle('#ffffff');
    //     // } else {
    //     //     canvas.setFillStyle('#000000');
    //     // }

    //     // canvas.fillRect(body.x, body.y, body.w, body.h);
    //     // canvas.strokeRect(body.x, body.y, body.w, body.h);
    // }

    private renderCandle(
        canvas: ICanvas, timeAxis: ITimeAxis, yAxis: IAxis<number>, candle: Candlestick, frame: IRect,
        candleW: number, x: number): void {

        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }

        // Startin drawing
        canvas.beginPath();
        canvas.lineWidth = 1;
        canvas.setStrokeStyle('#191919');

        // We are not calculating x, as currentX is faster
        // let x = timeAxis.toX(candle.uid);
        // if (x === undefined) {
        //     return;
        // }

        x = Math.round(x);

        const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);
        const h = yAxis.toX(candle.h);
        const l = yAxis.toX(candle.l);

        // Drawing upper shadow
        this.line(canvas, x, body.y, x, h );

        // Drawing lower shadow
        this.line(canvas, x, l, x, body.y + body.h);

        canvas.stroke();

        // Drawing body
        if (candle.c > candle.o) {
            canvas.setFillStyle('#F7F7F7'); //#008910');
        } else {
            canvas.setFillStyle('#191919'); //#D80300');
        }

        canvas.fillRect(body.x, body.y, body.w, body.h);
        canvas.strokeRect(body.x, body.y, body.w, body.h);

        // // Draw uid
        // canvas.setFillStyle('#111111');
        // const markText = candle.uid;
        // const w = canvas.measureText(markText).width;
        // canvas.setTextBaseLine(CanvasTextBaseLine.Top);
        // canvas.fillText(markText, x - w / 2, body.y);
        // canvas.fillText(markText, x - w / 2, body.y + body.h);
    }

    private calculateBody(x: number, yAxis: IAxis<number>, o: number, c: number, candleW: number): IRect {
        const ocMin = yAxis.toX(Math.max(o, c)); // Inverted Y
        const ocMax = yAxis.toX(Math.min(o, c));
        return { x: x - Math.floor(candleW / 2), y: ocMin, w: candleW, h: ocMax - ocMin };
    }

    private calculateBodyWidth(timeAxis: ITimeAxis, frameWidth: number): number {
        return (timeAxis.count > 0) ? frameWidth / timeAxis.count : 0;

        // // const range = timeAxis.range.end.getTime() - timeAxis.range.start.getTime();
        // // if (range === 0 || timeAxis.interval === 0) {
        // //     return this.minCandleWidth;
        // // }
        // // const candlesCount = range / timeAxis.interval;
        // const candlesCount = timeAxis.count; //  range / timeAxis.interval;
        // let w = Math.floor(frameWidth / candlesCount);
        // // make width odd (1, 3, 5, ...)
        // w = w - ((w + 1) % 2);
        // // between minCandleWidth and maxCandleWidth
        // return Math.min(this.maxCandleWidth, Math.max(this.minCandleWidth, w));
    }

    private line(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number): void {
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    }


    public getSettings(): SettingSet {
        return new SettingSet('renderer');
    }

    public setSettings(settings: SettingSet): void {
    }
}
