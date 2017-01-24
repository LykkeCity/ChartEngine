/**
 * LineChartRenderer
 * 
 * @classdesc Renders specified data in a form of line chart.
 */

import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IDataIterator } from '../data/index';
import { Point } from '../model/index';
import { ISize } from '../shared/index';
import { IChartRender } from './Interfaces';

export class LineChartRenderer implements IChartRender<Point> {

    public render(
        canvas: ICanvas,
        dataIterator: IDataIterator<Point>,
        offsetX: number,
        offsetY: number,
        timeAxis: IAxis<Date>,
        yAxis: IAxis<number>): void {

        console.debug(`[LineChartRenderer] start rendering...`);

        // Calculate size of frame

        const frameSize: ISize = {
            width: canvas.w,
            height: canvas.h
        };

        // Calculate size of candles

        // Render
        if (dataIterator.moveNext()) {
            let prevPoint: Point = dataIterator.current;
            while (dataIterator.moveNext()) {
                if (dataIterator.current.value) {
                    this.renderPart(canvas, timeAxis, yAxis, prevPoint, dataIterator.current, frameSize);
                    prevPoint = dataIterator.current;
                }
            }
        }
    }

    private renderPart(canvas: ICanvas,
                       timeAxis: IAxis<Date>,
                       yAxis: IAxis<number>, pointFrom: Point, pointTo: Point, frameSize: ISize): void {

        // Startin drawing
        canvas.setStrokeStyle('#555555');
        canvas.beginPath();

        const x1 = timeAxis.toX(pointFrom.date);
        const y1 = yAxis.toX(<number>pointFrom.value);

        const x2 = timeAxis.toX(pointTo.date);
        const y2 = yAxis.toX(<number>pointTo.value);

        // Drawing upper shadow
        this.line(canvas, x1, y1, x2, y2);

        canvas.stroke();
        canvas.closePath();
    }

    private line(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number): void {
        //console.debug(`line: {${x1},${y1}} - {${x2},${y2}}`);
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    }
}
