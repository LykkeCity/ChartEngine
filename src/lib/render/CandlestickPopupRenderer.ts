/**
 * CandlestickPopupRenderer class.
 */
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { Candlestick } from '../model/index';
import { IPoint, ISize } from '../shared/index';
import { IPopupRender } from './Interfaces';

export class CandlestickPopupRenderer implements IPopupRender<Candlestick> {
    private readonly paddingLeft = 5;
    private readonly paddingTop = 5;

    public render(canvas: ICanvas, model: Candlestick, point: IPoint, frameSize: ISize): void {
        const lineHeight = 20;
        const w = 90;
        const h = lineHeight * 4 + this.paddingTop * 2;
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
        canvas.fillText(`O: ${ this.formatValue(model.o) }`, x + this.paddingLeft, y + this.paddingTop);
        canvas.fillText(`C: ${ this.formatValue(model.c) }`, x + this.paddingLeft, y + this.paddingTop + lineHeight);
        canvas.fillText(`H: ${ this.formatValue(model.h) }`, x + this.paddingLeft, y + this.paddingTop + 2 * lineHeight);
        canvas.fillText(`L: ${ this.formatValue(model.l) }`, x + this.paddingLeft, y + this.paddingTop + 3 * lineHeight);

        // restore global value
        canvas.globalAlpha = alpha;
    }

    private formatValue(n: number | undefined): string {
        return (n !== undefined) ? n.toFixed(4) : '';
    }
}
