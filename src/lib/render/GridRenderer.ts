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
        xAxis.reset();
        const gridX = xAxis.getGrid();
        gridX.forEach((bar, index) => {
            const time = bar.getTime();
            while (xAxis.moveNext()) {
                if (xAxis.current.t.getTime() === time) {
                    const x = xAxis.currentX;
                    canvas.moveTo(x, frame.y);
                    canvas.lineTo(x, frame.y + frame.h);
                    break;
                }
            }
        });

        // const gridX = xAxis.getGrid();
        // gridX.forEach((bar, index) => {
        //     if (bar) {
        //         const x = xAxis.toX(new Uid(bar));
        //         if (x) {
        //             canvas.moveTo(x, frame.y);
        //             canvas.lineTo(x, frame.y + frame.h);
        //         }
        //     }
        // });

        // Horizontal lines
        const gridY = yAxis.getGrid();
        for (const bar of gridY) {
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
