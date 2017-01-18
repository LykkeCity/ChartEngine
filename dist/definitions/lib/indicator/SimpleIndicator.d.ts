/**
 * SimpleIndicator class.
 */
import { IChartData, IDataSource } from '../data';
import { Candlestick, Point } from '../model';
import { IEvent, IRange } from '../shared';
export declare class SimpleIndicator implements IDataSource<Point> {
    private dataSource;
    private dateChangedEvent;
    constructor(dataSource: IDataSource<Candlestick>);
    readonly dateChanged: IEvent<void>;
    getData(range: IRange<Date>): IChartData<Point>;
    protected onDataSourceChanged(arg?: void): void;
}
