/**
 * 
 */
import { ChartType } from '../core/index';
import { DataType } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { AxisRenderer } from './AxisRenderer';
import { CandlestickChartRenderer } from './CandlestickChartRenderer';
import { IAxesRender, IChartRender, IMarkRender, IPopupRender, IRenderLocator } from './Interfaces';
import { LineChartRenderer } from './LineChartRenderer';

export class RenderLocator implements IRenderLocator {

    private candlestickChartRender: CandlestickChartRenderer = new CandlestickChartRenderer();
    private lineChartRender: LineChartRenderer = new LineChartRenderer();
    private axisRenderer: AxisRenderer = new AxisRenderer();

    private static instance: RenderLocator;

    public static get Instance()
    {
        return this.instance || (this.instance = new this());
    }

    private constructor() {
    }

    //public getChartRender(chartType: string, dataType: string): any { //IChartRender<T> 
    public getChartRender<T>(dataType: { new(d: Date): T }, chartType: string): any {

        const obj = new dataType(new Date());

        if (obj instanceof Point) {
            if (chartType === ChartType.line) {
                return this.lineChartRender;
            }
        } else if (obj instanceof Candlestick) {
            if (chartType === ChartType.candle) {
                return this.candlestickChartRender;
            }
        } else {
            throw new Error('Unexpected data type: ' + dataType);
        }

        throw new Error('Unexpected chart type ' + chartType);
    }

    public getAxesRender(uid: string): IAxesRender {
        switch (uid) {
            case 'date': return this.axisRenderer;
            default:
                throw new Error('Unexpected axes render uid: ' + uid);
        }
    }

    public getPopupRender(uid: string): IPopupRender {
        throw new Error('Not implemented.');
    }

    public getMarkRender(uid: string): IMarkRender {
        throw new Error('Not implemented.');
    }
}
