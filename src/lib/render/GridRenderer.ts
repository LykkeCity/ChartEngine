/**
 * AxisRenderer
 * 
 * @classdesc Contains methods for rendering axes.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, ITimeAxis } from '../core/index';
import { Uid } from '../model/index';
import { IRect } from '../shared/index';

export class GridRenderer {

    public render(canvas: ICanvas, frame: IRect, xAxis: ITimeAxis, yAxis: IAxis<number>): void {

        canvas.beginPath();
        canvas.setStrokeStyle('#EAEAEA');
        canvas.lineWidth = 1;

        // Vertical lines
        const gridX = xAxis.getGrid();
        gridX.reset();
        while (gridX.moveNext()) {
            const x = gridX.current.x;
            canvas.moveTo(x, frame.y);
            canvas.lineTo(x, frame.y + frame.h);
        }

        // Horizontal lines
        const gridY = yAxis.getGrid();
        for (const bar of gridY.bars) {
            if (bar !== undefined) {
                const y = yAxis.toX(bar);
                canvas.moveTo(frame.x, y);
                canvas.lineTo(frame.x + frame.w, y);
            }
        }

        canvas.stroke();
        canvas.closePath();
    }
}
