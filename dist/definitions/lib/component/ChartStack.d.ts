/**
 * ChartStack class.
 */
import { IAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';
export declare class ChartStack extends VisualComponent {
    private timeAxis;
    private yAxis;
    private charts;
    private crosshair;
    constructor(offset: Point, size: ISize, timeAxis: IAxis<Date>, yAxis: IAxis<number>);
    addChart<T>(chartType: string, dataSource: IDataSource<T>): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
