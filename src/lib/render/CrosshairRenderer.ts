/**
 * CrosshairRenderer class.
 */
import { ICanvas } from '../canvas/index';
import { IPoint, ISize } from '../shared/index';

export class CrosshairRenderer {
    public render(canvas: ICanvas, point: IPoint, frameSize: ISize): void {

        // Draw crosshair
        //
        canvas.setStrokeStyle('black');
        const curDash = canvas.getLineDash();
        canvas.setLineDash([5, 5]);
        canvas.lineWidth = 1;
        canvas.beginPath();
        if (point.x > 0 && point.x < frameSize.width) {
            // draw vertical line
            canvas.moveTo(point.x, 0);
            canvas.lineTo(point.x, frameSize.height);
        }
        if (point.y > 0 && point.y < frameSize.height) {
            // draw horizontal line
            canvas.moveTo(0, point.y);
            canvas.lineTo(frameSize.width, point.y);
        }
        canvas.stroke();
        canvas.closePath();
        canvas.setLineDash(curDash);
    }
}
