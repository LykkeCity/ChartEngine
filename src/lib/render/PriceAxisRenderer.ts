/**
 * AxisRenderer
 * 
 * @classdesc Contains methods for rendering axes.
 */
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { IAxis } from '../core/index';
import { IRect } from '../shared/index';
import { IAxesRender } from './Interfaces';

export class PriceAxisRenderer implements IAxesRender<number> {

    public render(canvas: ICanvas, axis: IAxis<number>, frame: IRect): void {

        const bars = axis.getGrid();

        canvas.font = '11px Arial';
        canvas.fillStyle = '#000000';
        canvas.setStrokeStyle('black');
        canvas.beginPath();

        for (const bar of bars) {
            if (bar !== undefined) {
                const y = axis.toX(bar);
                if (y !== undefined) {
                    this.drawBar(canvas, bar, y);
                }
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
        canvas.setTextBaseLine(CanvasTextBaseLine.Middle);
        canvas.fillText(markText, 4, y);
    }
}
