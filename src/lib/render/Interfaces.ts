/**
 * Interfaces related to rendering.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint } from '../core/index';
import { IDataIterator } from '../data/index';
import { IRect, ISize } from '../shared/index';

export interface IRenderLocator {
    getChartRender<T>(dataType: { new(d: Date): T}, chartType: string): any;
    getAxesRender(uid: string): any;
    getPopupRender<T>(dataType: { new(d: Date): T}): any;
    getMarkRender(uid: string): any;
    getCrosshairRender(): any;
    getGridRender(): any;
}

export interface IChartRender<T> {
    render(canvas: ICanvas,
           data: IDataIterator<T>,
           frame: IRect,
           timeAxis: IAxis<Date>,
           yAxis: IAxis<number>): void;
    testHitArea(
           hitPoint: IPoint,
           data: IDataIterator<T>,
           frame: IRect,
           timeAxis: IAxis<Date>,
           yAxis: IAxis<number>): T | undefined;
}

export interface IAxesRender<T> {
    render(
        canvas: ICanvas,
        axis: IAxis<T>,
        frame: IRect): void;
}

export interface IPopupRender<T> {
    render(canvas: ICanvas, data: T, point: IPoint, frameSize: ISize): void;
}

export interface IMarkRender<T> {
    render(canvas: ICanvas, data: T, point: IPoint, frameSize: ISize): void;
}
