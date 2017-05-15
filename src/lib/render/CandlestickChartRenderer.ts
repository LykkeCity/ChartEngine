/**
 * CandlestickChartRenderer
 * 
 * @classdesc Renders specified data in a form of candlestick chart.
 */
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IRect } from '../shared/index';
import { IChartRender } from './Interfaces';

export class CandlestickChartRenderer implements IChartRender<Candlestick>  {

    private readonly minCandleWidth = 1;
    private readonly maxCandleWidth = 21;

    public constructor() { }

    public render(
        canvas: ICanvas,
        dataIterator: IDataIterator<Candlestick>,
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

        let found = false;
        timeAxis.reset();
        while (timeAxis.moveNext()) {
            const curUid = timeAxis.current;
            const curTime = curUid.t.getTime();
            const curn = curUid.n;
            const x = timeAxis.currentX;

            if (!found) {
                found = dataIterator.goTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn);
            } else {
                found = dataIterator.moveTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn) !== -1;
            }

            if (found) {
                const candle = dataIterator.current;

                this.renderCandle(canvas, timeAxis, yAxis, candle, frame, candleW, x);
            }
        }
    }

    public testHitArea(
            hitPoint: IPoint,
            dataIterator: IDataIterator<Candlestick>,
            //data: Candlestick[],
            frame: IRect,
            timeAxis: ITimeAxis,
            yAxis: IAxis<number>): Candlestick | undefined {

        let candleHit: Candlestick | undefined = undefined;

        const candleW = this.calculateBodyWidth(timeAxis, frame.w);

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
        let x = timeAxis.toX(candle.uid);
        if (x !== undefined) {
            x = Math.round(x);

            const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);
            return (hitPoint.x >= body.x && hitPoint.x <= (body.x + body.w)
                    && hitPoint.y >= body.y && hitPoint.y <= (body.y + body.h));
        }
        return false;
    }

    private renderCandle(
        canvas: ICanvas, timeAxis: ITimeAxis, yAxis: IAxis<number>, candle: Candlestick, frame: IRect,
        candleW: number, x: number): void {

        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }
        const colorUp = this.settings.colorUp;
        const colorDown = this.settings.colorDown;
        const colorBorder = this.settings.colorBorder;

        x = Math.round(x);

        const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);
        const h = yAxis.toX(candle.h);
        const l = yAxis.toX(candle.l);

        // Startin drawing
        canvas.beginPath();
        canvas.lineWidth = 1;
        canvas.setStrokeStyle(colorBorder);

        if (body.w > 2) {
            // Drawing upper shadow
            this.line(canvas, x, body.y, x, h );

            // Drawing lower shadow
            this.line(canvas, x, l, x, body.y + body.h - 1);

            canvas.stroke();
        }

        // Drawing body

        if (body.w > 2) {
            if (candle.c > candle.o) {
                canvas.setFillStyle(colorUp);
            } else {
                canvas.setFillStyle(colorDown);
            }
            canvas.fillRect(body.x, body.y, body.w, body.h);
            canvas.strokeRect(body.x, body.y, body.w, body.h);
        } else {
            canvas.beginPath();
            if (candle.c > candle.o) {
                canvas.setStrokeStyle(colorUp);
            } else {
                canvas.setStrokeStyle(colorDown);
            }
            this.line(canvas, x, body.y, x, body.y + body.h);
            canvas.stroke();
        }
    }

    private calculateBody(x: number, yAxis: IAxis<number>, o: number, c: number, candleW: number): IRect {
        const ocMin = yAxis.toX(Math.max(o, c)); // Inverted Y
        const ocMax = yAxis.toX(Math.min(o, c));
        return { x: x - Math.floor(candleW / 2), y: ocMin, w: candleW, h: ocMax - ocMin };
    }

    private calculateBodyWidth(timeAxis: ITimeAxis, frameWidth: number): number {

        const candlesCount = timeAxis.count; //  range / timeAxis.interval;
        let w = frameWidth / (3 * candlesCount);

        if (w < 1.3) {
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

    private settings: CandleRenderSettings = new CandleRenderSettings();

    public getSettings(): SettingSet {
        const settings = new SettingSet({ name: 'visual', group: true });

        settings.setSetting('colorUp', new SettingSet({
            name: 'colorUp',
            dispalyName: 'Rising color',
            settingType: SettingType.color,
            value: this.settings.colorUp.toString()
        }));

        settings.setSetting('colorDown', new SettingSet({
            name: 'colorDown',
            dispalyName: 'Falling color',
            settingType: SettingType.color,
            value: this.settings.colorDown.toString()
        }));

        settings.setSetting('colorBorder', new SettingSet({
            name: 'colorBorder',
            dispalyName: 'Border color',
            settingType: SettingType.color,
            value: this.settings.colorBorder.toString()
        }));

        return settings;
    }

    public setSettings(value: SettingSet): void {
        const colorUp = value.getSetting('visual.colorUp');
        this.settings.colorUp = (colorUp && colorUp.value) ? colorUp.value : this.settings.colorUp;

        const colorDown = value.getSetting('visual.colorDown');
        this.settings.colorDown = (colorDown && colorDown.value) ? colorDown.value : this.settings.colorDown;

        const colorBorder = value.getSetting('visual.colorBorder');
        this.settings.colorBorder = (colorBorder && colorBorder.value) ? colorBorder.value : this.settings.colorBorder;
    }
}

class CandleRenderSettings {
    public colorUp = '#008910';
    public colorDown = '#D80300';
    public colorBorder = '#333333';
}
