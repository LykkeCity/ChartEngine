import { IAxesRender, IMarkRender, IPopupRender, IRenderLocator } from './Interfaces';
export declare class RenderLocator implements IRenderLocator {
    private candlestickChartRender;
    private lineChartRender;
    private axisRenderer;
    private static instance;
    static readonly Instance: RenderLocator;
    private constructor();
    getChartRender<T>(dataType: {
        new (d: Date): T;
    }, chartType: string): any;
    getAxesRender(uid: string): IAxesRender;
    getPopupRender(uid: string): IPopupRender;
    getMarkRender(uid: string): IMarkRender;
}
