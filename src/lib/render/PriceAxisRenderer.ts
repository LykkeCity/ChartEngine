/**
 * AxisRenderer
 * 
 * @classdesc Contains methods for rendering axes.
 */

import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { TimeInterval } from '../core/index';
import { IPoint, IRange, ISize } from '../shared/index';
import { IAxesRender } from './Interfaces';

export class PriceAxisRenderer implements IAxesRender<number> {

    public render(canvas: ICanvas, axis: IAxis<number>, offset: IPoint, size: ISize): void {

        canvas.setStrokeStyle('black');
        canvas.beginPath();

        canvas.strokeRect(offset.x, offset.y, size.width, size.height);

        canvas.stroke();
        canvas.closePath();
    }
}
