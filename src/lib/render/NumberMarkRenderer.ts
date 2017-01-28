/**
 * NumberMarkRenderer class.
 */
import { ICanvas } from '../canvas/index';
import { IPoint, ISize } from '../shared/index';
import { IMarkRender } from './Interfaces';

export class NumberMarkRenderer implements IMarkRender<number> {
    public render(canvas: ICanvas, data: number, point: IPoint, frameSize: ISize): void {
        const text = data.toFixed(4).toString();
        canvas.font = '10px Arial';
        canvas.fillStyle = '#000000';
        canvas.fillText(text, point.x, point.y);
    }
}
