import { IAxesRender, IChartRender, IMarkRender, IPopupRender, IRenderLocator } from './Interfaces';
export declare class RenderLocator implements IRenderLocator {
    private candlestickChartRender;
    private lineChartRender;
    private axisRenderer;
    private static instance;
    static readonly Instance: RenderLocator;
    private constructor();
    getChartRender(uid: string): IChartRender;
    getAxesRender(uid: string): IAxesRender;
    getPopupRender(uid: string): IPopupRender;
    getMarkRender(uid: string): IMarkRender;
}
