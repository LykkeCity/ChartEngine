/**
 * TimeMarkRenderer class.
 */
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { IPoint } from '../core/index';
import { ISize } from '../shared/index';
import { IMarkRender } from './Interfaces';

export class TimeMarkRenderer implements IMarkRender<Date> {
    private readonly paddingLeft = 3;
    private readonly paddingTop  = 5;

    public render(canvas: ICanvas, data: Date, point: IPoint, frameSize: ISize): void {
        if (data && data instanceof Date) {
            const hh = data.getUTCHours();
            const mm = data.getUTCMinutes();
            const hhmm = ('0' + hh.toFixed(0)).slice(-2) + ':' + ('0' + mm.toFixed(0)).slice(-2);
            const text = `${data.getUTCFullYear()}-${data.getUTCMonth() + 1}-${data.getUTCDate()} ${hhmm}`;

            const textWidth = canvas.measureText(text).width;
            canvas.fillStyle = '#3F3F3F';
            canvas.fillRect(point.x - textWidth / 2 - this.paddingLeft, point.y, textWidth + this.paddingLeft * 2, 18);

            canvas.font = '11px Arial';
            canvas.fillStyle = '#EAEAEA';
            canvas.setTextBaseLine(CanvasTextBaseLine.Top);
            canvas.fillText(text, point.x - textWidth / 2, point.y + this.paddingTop);
        }
    }
}
