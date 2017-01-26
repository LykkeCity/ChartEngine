/**
 * TimeMarkRenderer class.
 */
import { ICanvas } from '../canvas/index';
import { Candlestick } from '../model/index';
import { IPoint, ISize } from '../shared/index';
import { IMarkRender } from './Interfaces';

export class TimeMarkRenderer implements IMarkRender<Date> {
    public render(canvas: ICanvas, data: Date, point: IPoint, frameSize: ISize): void {
        canvas.setStrokeStyle('black');
        canvas.beginPath();
        const text = data.toString();
        canvas.strokeText(text, point.x, point.y);
        canvas.stroke();
        canvas.closePath();
    }
}
