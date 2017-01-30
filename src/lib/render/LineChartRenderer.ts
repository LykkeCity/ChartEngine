/**
 * LineChartRenderer
 * 
 * @classdesc Renders specified data in a form of line chart.
 */

import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IDataIterator } from '../data/index';
import { Point } from '../model/index';
import { IPoint, IRect } from '../shared/index';
import { IChartRender } from './Interfaces';

export class LineChartRenderer implements IChartRender<Point> {

    public render(
        canvas: ICanvas,
        dataIterator: IDataIterator<Point>,
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

        // Start drawing
        canvas.setStrokeStyle('#555555');
        canvas.beginPath();

        if (dataIterator.moveNext()) {
            let prevPoint: Point = dataIterator.current;
            while (dataIterator.moveNext()) {
                if (dataIterator.current.value) {
                    this.renderPart(canvas, timeAxis, yAxis, prevPoint, dataIterator.current, frame);
                    prevPoint = dataIterator.current;
                }
            }
        }

        canvas.stroke();
        canvas.closePath();
    }

    public testHitArea(
        hitPoint: IPoint,
        dataIterator: IDataIterator<Point>,
        frame: IRect,
        timeAxis: IAxis<Date>,
        yAxis: IAxis<number>): Point | undefined {

        while (dataIterator.moveNext()) {
            if (dataIterator.current.value) {

                const x = timeAxis.toX(dataIterator.current.date);
                const y = yAxis.toX(dataIterator.current.value);

                const R = Math.sqrt(Math.pow(Math.abs(x - hitPoint.x), 2) + Math.pow(Math.abs(y - hitPoint.y), 2));
                if (R < 2) {
                    return dataIterator.current;
                }
            }
        }
    }

    private renderPart(canvas: ICanvas,
                       timeAxis: IAxis<Date>,
                       yAxis: IAxis<number>, pointFrom: Point, pointTo: Point, frame: IRect): void {

        const x1 = timeAxis.toX(pointFrom.date);
        const y1 = yAxis.toX(<number>pointFrom.value);
        const x2 = timeAxis.toX(pointTo.date);
        const y2 = yAxis.toX(<number>pointTo.value);

        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    }
}
