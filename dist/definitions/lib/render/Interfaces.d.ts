/**
 * Interfaces related to rendering.
 */
import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IDataIterator } from '../data/index';
import { IPoint, IRect, ISize } from '../shared/index';
export interface IRenderLocator {
    getChartRender<T>(dataType: {
        new (d: Date): T;
    }, chartType: string): any;
    getAxesRender<T>(uid: string): any;
    getPopupRender<T>(dataType: {
        new (d: Date): T;
    }): any;
    getMarkRender<T>(uid: string): any;
    getCrosshairRender(): any;
    getGridRender(): any;
}
export interface IChartRender<T> {
    render(canvas: ICanvas, data: IDataIterator<T>, frame: IRect, timeAxis: IAxis<Date>, yAxis: IAxis<number>): void;
    testHitArea(hitPoint: IPoint, data: IDataIterator<T>, frame: IRect, timeAxis: IAxis<Date>, yAxis: IAxis<number>): T | undefined;
}
export interface IAxesRender<T> {
    render(canvas: ICanvas, axis: IAxis<T>, frame: IRect): void;
}
export interface IPopupRender<T> {
    render(canvas: ICanvas, data: T, point: IPoint, frameSize: ISize): void;
}
export interface IMarkRender<T> {
    render(canvas: ICanvas, data: T, point: IPoint, frameSize: ISize): void;
}
