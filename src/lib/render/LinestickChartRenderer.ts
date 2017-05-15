/**
 * LinestickChartRenderer
 * 
 * @classdesc Renders candlesticks in a form of line chart.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IRect } from '../shared/index';
import { IChartRender } from './Interfaces';
import { RenderUtils } from './RenderUtils';

export class LinestickChartRenderer implements IChartRender<Candlestick> {

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

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#555555');

        RenderUtils.renderLineChart(canvas, dataIterator, item => {
            if (item.c !== undefined) {
                return { uid: item.uid, v: item.c };
            }
        }, frame, timeAxis, yAxis, false);

        canvas.stroke();
    }

    public testHitArea(
        hitPoint: IPoint,
        dataIterator: IDataIterator<Candlestick>,
        //data: Candlestick[],
        frame: IRect,
        timeAxis: ITimeAxis,
        yAxis: IAxis<number>): Candlestick | undefined {

        // while (dataIterator.moveNext()) {
        //     if (dataIterator.current.c !== undefined) {

        //         const x = timeAxis.toX(dataIterator.current.date);
        //         const y = yAxis.toX(dataIterator.current.c);

        //         const R = Math.sqrt(Math.pow(Math.abs(x - hitPoint.x), 2) + Math.pow(Math.abs(y - hitPoint.y), 2));
        //         if (R < 2) {
        //             return dataIterator.current;
        //         }
        //     }
        // }
        return undefined;
    }


    public getSettings(): SettingSet {
        return new SettingSet('renderer');
    }

    public setSettings(settings: SettingSet): void {
    }
}
