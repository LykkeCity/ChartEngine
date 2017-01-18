/**
 * Interfaces related to rendering.
 */
import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
import { Candlestick } from '../model';

export interface IRenderLocator {
    getChartRender(uid: string): IChartRender;
    getAxesRender(uid: string): IAxesRender;
    getPopupRender(uid: string): IPopupRender;
    getMarkRender(uid: string): IMarkRender;
}

export interface IChartRender {
    render(canvas: ICanvas,
            data: any,
            offsetX: number,
            offsetY: number,
            timeAxis: IAxis<Date>,
            yAxis: IAxis<number>): void;
}

export interface IAxesRender {
    renderDateAxis(dateAxis: IAxis<Date>, canvas: ICanvas): void;
}

export interface IPopupRender {

}

export interface IMarkRender {

}