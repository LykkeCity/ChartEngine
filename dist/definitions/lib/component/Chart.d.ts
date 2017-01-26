/**
 * Chart class.
 */
import { IAxis } from '../axes/index';
import { TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
export interface IChart {
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
export declare class Chart<T> extends VisualComponent implements IChart {
    private chartType;
    private dataSource;
    private timeAxis;
    private yAxis;
    private popup;
    constructor(chartType: string, offset: Point, size: ISize, dataSource: IDataSource<T>, timeAxis: IAxis<Date>, yAxis: IAxis<number>);
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
