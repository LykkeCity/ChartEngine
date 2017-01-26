/**
 * CandlestickPopupRenderer class.
 */
import { ICanvas } from '../canvas/index';
import { Candlestick } from '../model/index';
import { IPoint, ISize } from '../shared/index';
import { IPopupRender } from './Interfaces';

export class CandlestickPopupRenderer implements IPopupRender<Candlestick> {
    public render(canvas: ICanvas, model: Candlestick, point: IPoint, frameSize: ISize): void {
        canvas.setStrokeStyle('black');
        canvas.beginPath();
        const text = `[ Candle: ${ model.o } ${ model.c }]`;
        canvas.strokeText(text, point.x, point.y);
        canvas.stroke();
        canvas.closePath();
    }
}
