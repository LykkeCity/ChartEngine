/**
 * AxisRenderer
 * 
 * @classdesc Contains methods for rendering axes.
 */

import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { TimeInterval } from '../core/index';
import { IPoint, IRange, IRect, ISize } from '../shared/index';
import { IAxesRender } from './Interfaces';

export class PriceAxisRenderer implements IAxesRender<number> {

    public render(canvas: ICanvas, axis: IAxis<number>, frame: IRect): void {

        const bars: number[] = axis.getGrid();

        canvas.font = '10px Courier New';
        canvas.setStrokeStyle('black');
        canvas.beginPath();

        for (const bar of bars) {
            const y = axis.toX(bar);
            if (y !== undefined) {
                this.drawBar(canvas, bar, y);
            }
        }

        canvas.stroke();
        canvas.closePath();
    }

    private drawBar(canvas: ICanvas, value: number, y: number) : void {
        canvas.moveTo(0, y);
        canvas.lineTo(3, y);

        // draw time mark
        const markText = value.toFixed(4);
        canvas.strokeText(markText, 4, y + 3);
    }
}
