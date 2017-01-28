/**
 * TimeMarkRenderer class.
 */
import { ICanvas } from '../canvas/index';
import { IPoint, ISize } from '../shared/index';
import { IMarkRender } from './Interfaces';

export class TimeMarkRenderer implements IMarkRender<Date> {
    public render(canvas: ICanvas, data: Date, point: IPoint, frameSize: ISize): void {
        const text = data.toString();
        canvas.font = '10px Arial';
        canvas.fillStyle = '#000000';
        canvas.fillText(text, point.x, point.y);
    }
}
