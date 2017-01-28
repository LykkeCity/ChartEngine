/**
 * RenderLocator singleton.
 */
import { ChartType } from '../core/index';
import { Candlestick, Point } from '../model/index';
import { CandlestickChartRenderer } from './CandlestickChartRenderer';
import { CandlestickPopupRenderer } from './CandlestickPopupRenderer';
import { CrosshairRenderer } from './CrosshairRenderer';
import { GridRenderer } from './GridRenderer';
import { IRenderLocator } from './Interfaces';
import { LineChartRenderer } from './LineChartRenderer';
import { LinePopupRenderer } from './LinePopupRenderer';
import { NumberAxisRenderer } from './NumberAxisRenderer';
import { NumberMarkRenderer } from './NumberMarkRenderer';
import { PriceAxisRenderer } from './PriceAxisRenderer';
import { TimeAxisRenderer } from './TimeAxisRenderer';
import { TimeMarkRenderer } from './TimeMarkRenderer';

export class RenderLocator implements IRenderLocator {

    private candlestickChartRender: CandlestickChartRenderer = new CandlestickChartRenderer();
    private lineChartRender: LineChartRenderer = new LineChartRenderer();
    private timeAxisRender: TimeAxisRenderer = new TimeAxisRenderer();
    private priceAxisRender: PriceAxisRenderer = new PriceAxisRenderer();
    private numberAxisRender: NumberAxisRenderer = new NumberAxisRenderer();
    private candlePopupRenderer: CandlestickPopupRenderer = new CandlestickPopupRenderer();
    private linePopupRenderer: LinePopupRenderer = new LinePopupRenderer();
    private timeMarkRender: TimeMarkRenderer = new TimeMarkRenderer();
    private numberMarkRender: NumberMarkRenderer = new NumberMarkRenderer();
    private crosshairRenderer: CrosshairRenderer = new CrosshairRenderer();
    private gridRenderer: GridRenderer = new GridRenderer();

    private static instance: RenderLocator;

    public static get Instance()
    {
        return this.instance || (this.instance = new this());
    }

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

    public getAxesRender(uid: string): any {
        switch (uid) {
            case 'date': return this.timeAxisRender;
            case 'number': return this.numberAxisRender;
            case 'price': return this.priceAxisRender;
            default:
                throw new Error('Unexpected axes render uid: ' + uid);
        }
    }

    public getPopupRender<T>(dataType: { new(d: Date): T }): any {
        const obj = new dataType(new Date());
        if (obj instanceof Point) {
            return this.linePopupRenderer;
        } else if (obj instanceof Candlestick) {
            return this.candlePopupRenderer;
        } else {
            throw new Error('Unexpected data type: ' + dataType);
        }
    }

    public getMarkRender(uid: string): any {
        switch (uid) {
            case 'date': return this.timeMarkRender;
            case 'number': return this.numberMarkRender;
            default:
                throw new Error('Unexpected axes render uid: ' + uid);
        }
    }

    public getCrosshairRender(): any {
        return this.crosshairRenderer;
    }

    public getGridRender(): any {
        return this.gridRenderer;
    }
}
