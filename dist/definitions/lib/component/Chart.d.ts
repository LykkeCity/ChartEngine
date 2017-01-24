/**
 * Chart class.
 */
import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { IRenderLocator } from '../render/index';
import { IRange, Point } from '../shared/index';
export interface IChart {
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
export declare class Chart<T> extends VisualComponent implements IChart {
    private chartType;
    offset: Point;
    private canvas;
    private dataSource;
    private timeAxis;
    private yAxis;
    constructor(chartType: string, offset: Point, canvas: ICanvas, dataSource: IDataSource<T>, timeAxis: IAxis<Date>, yAxis: IAxis<number>);
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
