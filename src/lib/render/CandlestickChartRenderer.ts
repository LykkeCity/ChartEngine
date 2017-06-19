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
import { RenderUtils } from './RenderUtils';

export class CandlestickChartRenderer implements IChartRender<Candlestick>  {

    private settings = new CandleRenderSettings();

    private readonly minCandleWidth = 1;
    private readonly maxCandleWidth = 21;

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

        const colorDown = this.settings.colorDown;
        const colorUp = this.settings.colorUp;
        const colorBorder = this.settings.colorBorder;

        const candleW = this.calculateBodyWidth(timeAxis, frame.w);

        canvas.lineWidth = 1;

        // Separate rendering of lines with different colors
        // to minimize state changes.
        //
        if (candleW > 2) {
            canvas.beginPath();
            canvas.setStrokeStyle(colorBorder);
            RenderUtils.iterate(timeAxis, dataIterator, (candle, x) => {
                this.renderShadows(canvas, timeAxis, yAxis, candle, frame, candleW, x);
            });
            canvas.stroke();

            // up bodies
            canvas.setFillStyle(colorUp);
            RenderUtils.iterate(timeAxis, dataIterator, (candle, x) => {
                this.renderBody(canvas, timeAxis, yAxis, candle, frame, candleW, x, true);
            });

            // down bodies
            canvas.setFillStyle(colorDown);
            RenderUtils.iterate(timeAxis, dataIterator, (candle, x) => {
                this.renderBody(canvas, timeAxis, yAxis, candle, frame, candleW, x, false);
            });

        } else {
            // render down lines
            canvas.beginPath();
            canvas.setStrokeStyle(colorDown);
            RenderUtils.iterate(timeAxis, dataIterator, (candle, x) => {
                this.renderLine(canvas, timeAxis, yAxis, candle, frame, candleW, x, colorDown, false);
            });
            canvas.stroke();

            // render up lines
            canvas.beginPath();
            canvas.setStrokeStyle(colorUp);
            RenderUtils.iterate(timeAxis, dataIterator, (candle, x) => {
                this.renderLine(canvas, timeAxis, yAxis, candle, frame, candleW, x, colorUp, true);
            });
            canvas.stroke();
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

    private renderShadows(
        canvas: ICanvas, timeAxis: ITimeAxis, yAxis: IAxis<number>, candle: Candlestick, frame: IRect,
        candleW: number, x: number): void {
        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }
        x = Math.round(x);
        const h = yAxis.toX(candle.h);
        const l = yAxis.toX(candle.l);
        this.line(canvas, x, l, x, h);
    }

    private renderBody(
        canvas: ICanvas, timeAxis: ITimeAxis, yAxis: IAxis<number>, candle: Candlestick, frame: IRect,
        candleW: number, x: number, up: boolean): void {
        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }
        x = Math.round(x);
        const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);

        if ((up && candle.c > candle.o) || (!up && candle.c <= candle.o)) {
            canvas.fillRect(body.x, body.y, body.w, body.h);
        }
    }

    private renderLine(
        canvas: ICanvas, timeAxis: ITimeAxis, yAxis: IAxis<number>, candle: Candlestick, frame: IRect,
        candleW: number, x: number, color: string, up: boolean): void {
        if (candle.c === undefined || candle.o === undefined || candle.h === undefined || candle.l === undefined) {
            return;
        }

        x = Math.round(x);

        const body = this.calculateBody(x, yAxis, candle.o, candle.c, candleW);

        if ((up && candle.c > candle.o) || (!up && candle.c <= candle.o)) {
            this.line(canvas, x, body.y, x, body.y + body.h);
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

    public getSettings(): SettingSet {
        const settings = new SettingSet({ name: 'visual', group: true, displayName: 'visual' });

        settings.setSetting('colorUp', new SettingSet({
            name: 'colorUp',
            displayName: 'Rising color',
            settingType: SettingType.color,
            value: this.settings.colorUp.toString()
        }));

        settings.setSetting('colorDown', new SettingSet({
            name: 'colorDown',
            displayName: 'Falling color',
            settingType: SettingType.color,
            value: this.settings.colorDown.toString()
        }));

        settings.setSetting('colorBorder', new SettingSet({
            name: 'colorBorder',
            displayName: 'Border color',
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
