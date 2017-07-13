/**
 * Interfaces related to rendering.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IConfigurable, ITimeAxis } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IPoint, IRect, ISize } from '../shared/index';

export interface IRenderLocator {
    getChartRender<T>(dataType: { new(d: Date): T}, chartType: string): any;
    getAxesRender(uid: string): any;
    getPopupRender<T>(dataType: { new(d: Date): T}): any;
    getMarkRender(uid: string): any;
    getCrosshairRender(): any;
    getGridRender(): any;
}

export interface IChartRender<T> extends IConfigurable {
    render(canvas: ICanvas,
           dataIterator: IDataIterator<T>,
           frame: IRect,
           timeAxis: ITimeAxis,
           yAxis: IAxis<number>): void;
    testHitArea(
           hitPoint: IPoint,
           dataIterator: IDataIterator<T>,
           frame: IRect,
           timeAxis: ITimeAxis,
           yAxis: IAxis<number>): T | undefined;
}

export interface IAxesRender<T> {
    render(
        canvas: ICanvas,
        axis: IAxis<T>,
        frame: IRect): void;
}

export interface ITimeAxisRender {
    render(
        canvas: ICanvas,
        axis: ITimeAxis,
        frame: IRect): void;
}

export interface IPopupRender<T> {
    render(canvas: ICanvas, data: T, point: IPoint, frameSize: ISize, precision: number): void;
}

export interface IMarkRender<T> {
    render(canvas: ICanvas, data: T, point: IPoint, frameSize: ISize, precision: number): void;
}
