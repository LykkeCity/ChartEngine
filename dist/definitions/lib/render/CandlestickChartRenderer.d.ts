/**
 * CandlestickChartRenderer
 *
 * @classdesc Renders specified data in a form of candlestick chart.
 */
import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IPoint, IRect } from '../shared/index';
import { IChartRender } from './Interfaces';
export declare class CandlestickChartRenderer implements IChartRender<Candlestick> {
    constructor();
    render(canvas: ICanvas, dataIterator: IDataIterator<Candlestick>, frame: IRect, timeAxis: IAxis<Date>, yAxis: IAxis<number>): void;
    testHitArea(hitPoint: IPoint, dataIterator: IDataIterator<Candlestick>, frame: IRect, timeAxis: IAxis<Date>, yAxis: IAxis<number>): Candlestick | undefined;
    private testHitAreaCandle(hitPoint, timeAxis, yAxis, candle);
    private renderCandle(canvas, timeAxis, yAxis, candle, frame);
    private calculateBody(x, yAxis, o, c);
    private line(canvas, x1, y1, x2, y2);
}
