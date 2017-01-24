/**
 * Interfaces related to rendering.
 */
import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IDataIterator } from '../data/index';
export interface IRenderLocator {
    getChartRender<T>(dataType: {
        new (d: Date): T;
    }, chartType: string): any;
    getAxesRender(uid: string): IAxesRender;
    getPopupRender(uid: string): IPopupRender;
    getMarkRender(uid: string): IMarkRender;
}
export interface IChartRender<T> {
    render(canvas: ICanvas, data: IDataIterator<T>, offsetX: number, offsetY: number, timeAxis: IAxis<Date>, yAxis: IAxis<number>): void;
}
export interface IAxesRender {
    renderDateAxis(dateAxis: IAxis<Date>, canvas: ICanvas): void;
}
export interface IPopupRender {
}
export interface IMarkRender {
}
