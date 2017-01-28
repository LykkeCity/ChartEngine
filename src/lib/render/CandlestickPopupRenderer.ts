/**
 * CandlestickPopupRenderer class.
 */
import { ICanvas } from '../canvas/index';
import { Candlestick } from '../model/index';
import { IPoint, ISize } from '../shared/index';
import { IPopupRender } from './Interfaces';

export class CandlestickPopupRenderer implements IPopupRender<Candlestick> {
    public render(canvas: ICanvas, model: Candlestick, point: IPoint, frameSize: ISize): void {
        const text = `[ Candle: ${ model.o } ${ model.c }]`;
        canvas.font = '10px Arial';
        canvas.fillStyle = '#000000';
        canvas.fillText(text, point.x, point.y);
    }
}
