/**
 * LinePopupRenderer class.
 */
import { ICanvas } from '../canvas/index';
import { Point } from '../model/index';
import { IPoint, ISize } from '../shared/index';
import { IPopupRender } from './Interfaces';

export class LinePopupRenderer implements IPopupRender<Point> {
    public render(canvas: ICanvas, model: Point, point: IPoint, frameSize: ISize): void {
        canvas.setStrokeStyle('black');
        canvas.beginPath();
        const text = `[Point: ${ model.value }]`;
        canvas.strokeText(text, point.x, point.y);
        canvas.stroke();
        canvas.closePath();
    }
}
