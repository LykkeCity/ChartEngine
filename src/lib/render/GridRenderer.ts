/**
 * AxisRenderer
 * 
 * @classdesc Contains methods for rendering axes.
 */

import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IRect } from '../shared/index';

export class GridRenderer {

    public render(canvas: ICanvas, frame: IRect, xAxis: IAxis<Date>, yAxis: IAxis<number>): void {

        canvas.setStrokeStyle('#DBDBDB');
        canvas.beginPath();

        // Vertical lines
        const gridX = xAxis.getGrid();
        for (const bar of gridX) {
            const x = xAxis.toX(bar);

            canvas.moveTo(x, frame.y);
            canvas.lineTo(x, frame.y + frame.h);
        }

        // Horizontal lines
        const gridY = yAxis.getGrid();
        for (const bar of gridY) {
            const y = yAxis.toX(bar);

            canvas.moveTo(frame.x, y);
            canvas.lineTo(frame.x + frame.w, y);
        }

        canvas.stroke();
        canvas.closePath();
    }
}
