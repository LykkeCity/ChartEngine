/**
 * Chart class.
 */
import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
import { VisualComponent, VisualContext } from '../core';
import { IRenderLocator, RenderType } from '../render';
import { Point } from '../shared';
export declare class Chart extends VisualComponent {
    private canvas;
    dataSource: any;
    private timeAxis;
    private yAxis;
    private renderType;
    constructor(offset: Point, canvas: ICanvas, dataSource: any, timeAxis: IAxis<Date>, yAxis: IAxis<number>, renderType: RenderType);
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
