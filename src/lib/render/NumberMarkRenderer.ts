/**
 * NumberMarkRenderer class.
 */
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { IPoint, ISize } from '../shared/index';
import { IMarkRender } from './Interfaces';

export class NumberMarkRenderer implements IMarkRender<number> {
    private readonly paddingLeft = 4;

    public render(canvas: ICanvas, value: number, point: IPoint, frameSize: ISize, precision: number): void {
        const text = value.toFixed(precision).toString();

        const textWidth = canvas.measureText(text).width;
        canvas.fillStyle = '#3F3F3F';
        canvas.fillRect(point.x, point.y - 8, textWidth + this.paddingLeft * 2, 16);

        canvas.font = '11px Arial';
        canvas.fillStyle = '#EAEAEA';
        canvas.setTextBaseLine(CanvasTextBaseLine.Middle);
        canvas.fillText(text, point.x + this.paddingLeft, point.y);
    }
}
