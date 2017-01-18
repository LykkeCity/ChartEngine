/**
 * 
 */
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

    public getChartRender(uid: string): IChartRender {
        switch (uid) {
            case 'line': return this.lineChartRender;
            case 'candle': return this.candlestickChartRender;
            default:
                throw new Error('Unexpected chart render uid: ' + uid);
        }
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
