import { IRenderLocator } from './Interfaces';
export declare class RenderLocator implements IRenderLocator {
    private candlestickChartRender;
    private lineChartRender;
    private timeAxisRender;
    private priceAxisRender;
    private numberAxisRender;
    private candlePopupRenderer;
    private linePopupRenderer;
    private timeMarkRender;
    private numberMarkRender;
    private static instance;
    static readonly Instance: RenderLocator;
    getChartRender<T>(dataType: {
        new (d: Date): T;
    }, chartType: string): any;
    getAxesRender<T>(uid: string): any;
    getPopupRender<T>(dataType: {
        new (d: Date): T;
    }): any;
    getMarkRender<T>(uid: string): any;
}
