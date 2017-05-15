/**
 * RenderLocator singleton.
 */
import { ChartType } from '../core/index';
import { Candlestick, Point } from '../model/index';
import { IHashTable } from '../shared/index';
import { CandlestickChartRenderer } from './CandlestickChartRenderer';
import { CandlestickPopupRenderer } from './CandlestickPopupRenderer';
import { CrosshairRenderer } from './CrosshairRenderer';
import { GridRenderer } from './GridRenderer';
import { HollowstickChartRenderer } from './HollowstickChartRenderer';
import { IChartRender, IRenderLocator } from './Interfaces';
import { LineChartRenderer } from './LineChartRenderer';
import { LinePopupRenderer } from './LinePopupRenderer';
import { LinestickChartRenderer } from './LinestickChartRenderer';
import { MountainChartRenderer } from './MountainChartRenderer';
import { NumberAxisRenderer } from './NumberAxisRenderer';
import { NumberMarkRenderer } from './NumberMarkRenderer';
import { OhlcChartRenderer } from './OhlcChartRenderer';
import { PriceAxisRenderer } from './PriceAxisRenderer';
import { RenkoChartRenderer } from './RenkoChartRenderer';
import { TimeAxisRenderer } from './TimeAxisRenderer';
import { TimeMarkRenderer } from './TimeMarkRenderer';

export class RenderLocator implements IRenderLocator {

    private lineChartRender = new LineChartRenderer();
    private timeAxisRender = new TimeAxisRenderer();
    private priceAxisRender = new PriceAxisRenderer();
    private numberAxisRender = new NumberAxisRenderer();
    private candlePopupRenderer = new CandlestickPopupRenderer();
    private linePopupRenderer = new LinePopupRenderer();
    private timeMarkRender = new TimeMarkRenderer();
    private numberMarkRender = new NumberMarkRenderer();
    private crosshairRenderer = new CrosshairRenderer();
    private gridRenderer = new GridRenderer();

    private renders: IHashTable<{ new(): IChartRender<Candlestick> }> = {};
    private builtinRenders: IHashTable<{ new(): IChartRender<Candlestick> }> = { };

    private static instance: RenderLocator;

    public static get Instance()
    {
        return this.instance || (this.instance = new this());
    }

    constructor() {
        this.builtinRenders[ChartType.candle] = CandlestickChartRenderer;
        this.builtinRenders[ChartType.heikinashi] = CandlestickChartRenderer;
        this.builtinRenders[ChartType.hollow] = HollowstickChartRenderer;
        this.builtinRenders[ChartType.line] = LinestickChartRenderer;
        this.builtinRenders[ChartType.mountain] = MountainChartRenderer;
        this.builtinRenders[ChartType.ohlc] = OhlcChartRenderer;
        this.builtinRenders[ChartType.rangebar] = OhlcChartRenderer;
        this.builtinRenders[ChartType.renko] = RenkoChartRenderer;
        this.builtinRenders[ChartType.linebreak] = RenkoChartRenderer;
    }

    public register(chartType: string, render: { new(): IChartRender<Candlestick> }) {
        this.renders[chartType] = render;
    }

    public getChartRender<T>(dataType: { new(d: Date): T }, chartType: string): any {

        // First check registered renders
        const render = this.renders[chartType];
        if (render) {
            return new render();
        }

        const obj = new dataType(new Date());

        if (obj instanceof Point) {
            if (chartType === ChartType.line) {
                return this.lineChartRender;
            }
        } else if (obj instanceof Candlestick) {
            const renderer = this.builtinRenders[chartType];
            if (renderer) {
                return new renderer();
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
