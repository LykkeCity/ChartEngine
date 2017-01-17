/**
 * LineChartRenderer
 * 
 * @classdesc Renders specified data in a form of line chart.
 */

import { IAxis, ICanvas } from 'core/Interfaces';
import { Point } from 'core/Model';
import { ISize } from 'shared/Interfaces';

export class LineChartRenderer {

    public static render(
        canvas: ICanvas,
        data: any,
        offsetX: number,
        offsetY: number,
        timeAxis: IAxis<Date>,
        yAxis: IAxis<number>): void {

        console.debug(`[LineChartRenderer] start rendering...`);

        // Calculate size of frame

        let frameSize: ISize = {
            width: canvas.w,
            height: canvas.h
        };

        // Calculate size of candles

        // Render
        for (let i = 1; i < data.data.length; i++) {
            this.renderPart(canvas, timeAxis, yAxis, data.data[i-1], data.data[i], frameSize);
        }
    }

    private static renderPart(canvas: ICanvas, 
        timeAxis: IAxis<Date>,
        yAxis: IAxis<number>, pointFrom: Point, pointTo: Point, frameSize: ISize): void {

        // Startin drawing
        canvas.setStrokeStyle('#555555');
        canvas.beginPath();

        let x1 = timeAxis.toX(pointFrom.date),
            y1 = yAxis.toX(pointFrom.value);

        let x2 = timeAxis.toX(pointTo.date),
            y2 = yAxis.toX(pointTo.value);

        // Drawing upper shadow
        this.line(canvas, x1, y1, x2, y2);

        canvas.stroke();
        canvas.closePath();
    }

    private static line(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number): void {
        console.debug(`line: {${x1},${y1}} - {${x2},${y2}}`);
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    }
}