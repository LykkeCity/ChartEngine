/**
 * ChartStack class.
 */
import { IAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { IRenderLocator } from '../render/index';
import { Point } from '../shared/index';
import { ChartArea } from './ChartArea';
export declare class ChartStack extends VisualComponent {
    private area;
    private timeAxis;
    private charts;
    private yAxis;
    constructor(area: ChartArea, offset: Point, timeAxis: IAxis<Date>);
    addChart<T>(chartType: string, dataSource: IDataSource<T>): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
