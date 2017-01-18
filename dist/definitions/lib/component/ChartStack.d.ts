/**
 * ChartStack class.
 */
import { IAxis } from '../axes';
import { VisualComponent, VisualContext } from '../core';
import { IDataSource } from '../data';
import { IRenderLocator, RenderType } from '../render';
import { Point } from '../shared';
import { ChartArea } from './ChartArea';
export declare class ChartStack extends VisualComponent {
    private area;
    private timeAxis;
    private charts;
    private yAxis;
    constructor(area: ChartArea, offset: Point, timeAxis: IAxis<Date>);
    addChart<T>(dataSource: IDataSource<T>, renderType: RenderType): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
