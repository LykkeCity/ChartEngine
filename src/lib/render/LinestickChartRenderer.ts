/**
 * LinestickChartRenderer
 * 
 * @classdesc Renders candlesticks in a form of line chart. Uses 'close' value as data source.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IRect } from '../shared/index';
import { IChartRender } from './Interfaces';

export class LinestickChartRenderer implements IChartRender<Candlestick> {

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

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#555555');

        if (dataIterator.moveNext()) {
            let x = timeAxis.toX(dataIterator.current.date);
            let y = yAxis.toX(<number>dataIterator.current.c);
            canvas.moveTo(x, y);
            while (dataIterator.moveNext()) {
                if (dataIterator.current.c) {
                    x = timeAxis.toX(dataIterator.current.date);
                    y = yAxis.toX(<number>dataIterator.current.c);
                    canvas.lineTo(x, y);
                }
            }
        }
        canvas.stroke();
    }

    public testHitArea(
        hitPoint: IPoint,
        dataIterator: IDataIterator<Candlestick>,
        frame: IRect,
        timeAxis: IAxis<Date>,
        yAxis: IAxis<number>): Candlestick | undefined {

        while (dataIterator.moveNext()) {
            if (dataIterator.current.c) {

                const x = timeAxis.toX(dataIterator.current.date);
                const y = yAxis.toX(dataIterator.current.c);

                const R = Math.sqrt(Math.pow(Math.abs(x - hitPoint.x), 2) + Math.pow(Math.abs(y - hitPoint.y), 2));
                if (R < 2) {
                    return dataIterator.current;
                }
            }
        }
    }
}
