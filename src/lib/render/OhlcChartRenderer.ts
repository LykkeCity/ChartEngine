/**
 * OhlcChartRenderer class.
 * 
 * @classdesc Renders specified data in a form of OHLC chart.
 */
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IRect } from '../shared/index';
import { IChartRender } from './Interfaces';
import { RenderUtils } from './RenderUtils';

export class OhlcChartRenderer implements IChartRender<Candlestick>  {

    private readonly minCandleWidth = 1;
    private readonly maxCandleWidth = 3;

    public constructor() { }

    public render(
        canvas: ICanvas,
        dataIterator: IDataIterator<Candlestick>,
        frame: IRect,
        timeAxis: ITimeAxis,
        yAxis: IAxis<number>): void {

        const lineW = this.calculateLineWidth(timeAxis, frame.w);

        RenderUtils.iterate(timeAxis, dataIterator, (candle, x) => {
            this.renderCandle(canvas, timeAxis, yAxis, candle, frame, lineW, x, dataIterator.previous);
        });

        // let found = false;
        // timeAxis.reset();
        // while (timeAxis.moveNext()) {
        //     const curUid = timeAxis.current;
        //     const curTime = curUid.t.getTime();
        //     const curn = curUid.n;
        //     const x = timeAxis.currentX;

        //     if (!found) {
        //         found = dataIterator.goTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn);
        //     } else {
        //         found = dataIterator.moveTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn) !== -1;
        //     }

        //     if (found) {
        //         const candle = dataIterator.current;
        //         this.renderCandle(canvas, timeAxis, yAxis, candle, frame, lineW, x, dataIterator.previous);
        //     }
        // }
    }

    public testHitArea(
            hitPoint: IPoint,
            dataIterator: IDataIterator<Candlestick>,
            //data: Candlestick[],
            frame: IRect,
            timeAxis: ITimeAxis,
            yAxis: IAxis<number>): Candlestick | undefined {

        let candleHit: Candlestick | undefined = undefined;

        const candleW = this.calculateLineWidth(timeAxis, frame.w);

        // while (dataIterator.moveNext()) {
        //     if (this.testHitAreaCandle(hitPoint, timeAxis, yAxis, dataIterator.current, candleW)) {
        //         candleHit = dataIterator.current;
        //         break;
        //     }
        // }

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
        // let x = timeAxis.toX(candle.uid);
        // if (x !== undefined) {
        //     x = Math.round(x);

        //     const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);
        //     return (hitPoint.x >= body.x && hitPoint.x <= (body.x + body.w)
        //             && hitPoint.y >= body.y && hitPoint.y <= (body.y + body.h));
        // }
        return false;
    }

    private renderCandle(
        canvas: ICanvas, timeAxis: ITimeAxis, yAxis: IAxis<number>, candle: Candlestick,
        frame: IRect, lineW: number, x: number,
        prevCandle?: Candlestick
        ): void {

        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }

        const colorUp = '#00B712';
        const colorDown = '#EA0000';

        let color;
        if (prevCandle && prevCandle.c) {
            color = (candle.c > prevCandle.c) ? colorUp : colorDown;
        } else {
            color = (candle.c > candle.o) ? colorUp : colorDown;
        }

        x = Math.round(x);
        const h = yAxis.toX(candle.h);
        const l = yAxis.toX(candle.l);
        const o = yAxis.toX(candle.o);
        const c = yAxis.toX(candle.c);
        const w = lineW + 3;

        // Startin drawing
        canvas.beginPath();
        canvas.lineWidth = lineW;
        canvas.setStrokeStyle(color);
        this.line(canvas, x, h, x, l);
        this.line(canvas, x - w, o, x, o); // open side
        this.line(canvas, x, c, x + w, c); // close side
        canvas.stroke();
    }

    private calculateLineWidth(timeAxis: ITimeAxis, frameWidth: number): number {

        const candlesCount = timeAxis.count;
        let w = frameWidth / (3 * candlesCount);

        if (w < 6) {
            return 1;
        } else {
            w = Math.ceil(w);
            w = w + ((w + 1) % 2);

            return Math.min(this.maxCandleWidth, w);
        }
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
