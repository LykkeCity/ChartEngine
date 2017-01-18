import { ChartArea } from './ChartArea';
import { IAxis } from '../axes';
import { IDataSource } from '../data';
import { RenderType } from '../render';
export declare class ChartStack {
    private area;
    private timeAxis;
    private charts;
    constructor(area: ChartArea, timeAxis: IAxis<Date>);
    addChart<T>(dataSource: IDataSource<T>, renderType: RenderType): void;
    render(): void;
}
