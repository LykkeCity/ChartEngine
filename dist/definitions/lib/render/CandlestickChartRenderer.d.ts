/**
 * CandlestickChartRenderer
 *
 * @classdesc Renders specified data in a form of candlestick chart.
 */
import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
export declare class CandlestickChartRenderer {
    constructor();
    render(canvas: ICanvas, data: any, offsetX: number, offsetY: number, timeAxis: IAxis<Date>, yAxis: IAxis<number>): void;
    private startRender(canvas);
    private finishRender(canvas);
    private renderCandle(canvas, timeAxis, yAxis, candle, frameSize);
    private line(canvas, x1, y1, x2, y2);
    private rect(canvas, x1, y1, x2, y2);
}
