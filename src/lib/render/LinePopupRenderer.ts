/**
 * LinePopupRenderer class.
 */
import { ICanvas } from '../canvas/index';
import { Point } from '../model/index';
import { IPoint, ISize } from '../shared/index';
import { IPopupRender } from './Interfaces';

export class LinePopupRenderer implements IPopupRender<Point> {
    public render(canvas: ICanvas, model: Point, point: IPoint, frameSize: ISize): void {
        const text = `[Point: ${ model.value }]`;
        canvas.font = '10px Arial';
        canvas.fillStyle = '#000000';
        canvas.fillText(text, point.x, point.y);
    }
}
