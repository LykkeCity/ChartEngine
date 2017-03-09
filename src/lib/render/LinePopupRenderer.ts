/**
 * LinePopupRenderer class.
 */
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { Point } from '../model/index';
import { IPoint, ISize } from '../shared/index';
import { IPopupRender } from './Interfaces';

export class LinePopupRenderer implements IPopupRender<Point> {
    private readonly paddingLeft = 5;
    private readonly paddingTop = 5;

    public render(canvas: ICanvas, model: Point, point: IPoint, frameSize: ISize): void {
        const lineHeight = 20;
        const w = 90;
        const h = lineHeight + this.paddingTop * 2;
        const x = Math.max(0, Math.min(point.x, frameSize.width - w));
        const y = Math.max(0, Math.min(point.y, frameSize.height - h));

        const alpha = canvas.globalAlpha;
        canvas.globalAlpha = 0.8;

        // border
        canvas.setStrokeStyle('#C0C0C0');
        canvas.strokeRect(x, y, w, h);

        // fill
        canvas.setFillStyle('#F2F2F2');
        canvas.fillRect(x, y, w, h);

        // text
        canvas.font = '10px Arial';
        canvas.fillStyle = 'black';
        canvas.setTextBaseLine(CanvasTextBaseLine.Top);
        canvas.fillText(`${ (model.value !== undefined ? model.value.toFixed(4) : '' ) }`, x + this.paddingLeft, y + this.paddingTop);

        // restore global value
        canvas.globalAlpha = alpha;
    }
}
